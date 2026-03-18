import crypto from "crypto"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

interface ConsumeRateLimitParams {
  scope: string
  identifier: string
  maxRequests: number
  windowSeconds: number
  blockDurationSeconds?: number
}

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
  remaining: number
}

function getRateLimitSecret(): string {
  const secret =
    process.env.RATE_LIMIT_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.ADMIN_SESSION_SECRET

  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV !== "production") {
      return "development-only-rate-limit-secret-override-at-least-32-chars-long"
    }

    throw new Error(
      "RATE_LIMIT_SECRET (or AUTH_SECRET/NEXTAUTH_SECRET) must be set and at least 32 characters"
    )
  }

  return secret
}

function hashIdentifier(scope: string, identifier: string): string {
  return crypto
    .createHmac("sha256", getRateLimitSecret())
    .update(`${scope}:${identifier}`)
    .digest("hex")
}

function parseIpCandidate(raw: string): string | null {
  const candidate = raw.trim().replace(/^"|"$/g, "")
  if (!candidate) {
    return null
  }

  const ipv4WithOptionalPort =
    /^(?<ip>(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3})(?::\d{1,5})?$/
  const ipv6 = /^(?:[A-Fa-f0-9:]+)$/

  const ipv4Match = candidate.match(ipv4WithOptionalPort)
  if (ipv4Match?.groups?.ip) {
    return ipv4Match.groups.ip
  }

  if (ipv6.test(candidate)) {
    return candidate.toLowerCase()
  }

  return null
}

export function getClientIp(headers: Headers): string {
  const headerCandidates = [
    headers.get("x-vercel-forwarded-for"),
    headers.get("cf-connecting-ip"),
    headers.get("x-real-ip"),
    headers.get("x-forwarded-for"),
  ]

  for (const headerValue of headerCandidates) {
    if (!headerValue) {
      continue
    }

    const fragments = headerValue.split(",")
    for (const fragment of fragments) {
      const parsed = parseIpCandidate(fragment)
      if (parsed) {
        return parsed
      }
    }
  }

  return "unknown"
}

export function buildRateLimitIdentifier(
  request: { headers: Headers },
  customDimension?: string
): string {
  const ip = getClientIp(request.headers)
  const userAgent = (request.headers.get("user-agent") ?? "unknown").slice(0, 160)
  return customDimension ? `${ip}|${userAgent}|${customDimension}` : `${ip}|${userAgent}`
}

async function acquireRateLimitLock(tx: Prisma.TransactionClient, key: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`
}

export async function consumeRateLimit(params: ConsumeRateLimitParams): Promise<RateLimitResult> {
  if (!Number.isInteger(params.maxRequests) || params.maxRequests <= 0) {
    throw new Error("maxRequests must be a positive integer")
  }

  if (!Number.isInteger(params.windowSeconds) || params.windowSeconds <= 0) {
    throw new Error("windowSeconds must be a positive integer")
  }

  const now = new Date()
  const windowMs = params.windowSeconds * 1000
  const blockDurationMs = (params.blockDurationSeconds ?? params.windowSeconds) * 1000
  const windowThreshold = new Date(now.getTime() - windowMs)
  const keyHash = hashIdentifier(params.scope, params.identifier)

  return prisma.$transaction(
    async (tx) => {
      await acquireRateLimitLock(tx, `rate-limit:${params.scope}:${keyHash}`)

      const existing = await tx.apiRateLimit.findUnique({
        where: {
          scope_keyHash: {
            scope: params.scope,
            keyHash,
          },
        },
      })

      if (!existing) {
        await tx.apiRateLimit.create({
          data: {
            scope: params.scope,
            keyHash,
            count: 1,
            windowStart: now,
            blockedUntil: null,
          },
        })

        return {
          allowed: true,
          retryAfterSeconds: 0,
          remaining: Math.max(params.maxRequests - 1, 0),
        }
      }

      if (existing.blockedUntil && existing.blockedUntil > now) {
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((existing.blockedUntil.getTime() - now.getTime()) / 1000)
        )
        return {
          allowed: false,
          retryAfterSeconds,
          remaining: 0,
        }
      }

      const windowExpired = existing.windowStart <= windowThreshold
      const nextCount = windowExpired ? 1 : existing.count + 1

      if (nextCount > params.maxRequests) {
        const blockedUntil = new Date(now.getTime() + blockDurationMs)
        await tx.apiRateLimit.update({
          where: {
            scope_keyHash: {
              scope: params.scope,
              keyHash,
            },
          },
          data: {
            count: nextCount,
            windowStart: windowExpired ? now : existing.windowStart,
            blockedUntil,
          },
        })

        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil(blockDurationMs / 1000)),
          remaining: 0,
        }
      }

      await tx.apiRateLimit.update({
        where: {
          scope_keyHash: {
            scope: params.scope,
            keyHash,
          },
        },
        data: {
          count: nextCount,
          windowStart: windowExpired ? now : existing.windowStart,
          blockedUntil: null,
        },
      })

      return {
        allowed: true,
        retryAfterSeconds: 0,
        remaining: Math.max(params.maxRequests - nextCount, 0),
      }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  )
}
