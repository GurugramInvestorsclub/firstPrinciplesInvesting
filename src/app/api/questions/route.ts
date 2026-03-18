import { NextResponse } from "next/server"
import { QuestionStatus } from "@prisma/client"
import { createQuestion, getQuestions } from "@/modules/questions/services/questionService"
import { createQuestionSchema } from "@/modules/questions/validation/questionSchema"
import { GetQuestionsFilters } from "@/modules/questions/types"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { buildRateLimitIdentifier, consumeRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

function parseQueryInt(value: string | null, fallback: number, min: number, max: number): number {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed)) {
    return fallback
  }

  return Math.min(Math.max(parsed, min), max)
}

export async function POST(req: Request) {
  try {
    const identifier = buildRateLimitIdentifier(req, "questions-post")
    let rateLimit: Awaited<ReturnType<typeof consumeRateLimit>> | null = null
    try {
      rateLimit = await consumeRateLimit({
        scope: "questions:post",
        identifier,
        maxRequests: 5,
        windowSeconds: 60 * 60,
        blockDurationSeconds: 60 * 60,
      })
    } catch (error) {
      console.error("Question rate limiter unavailable; continuing without throttle", error)
    }

    if (rateLimit && !rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too Many Requests. Maximum 5 questions per hour limit reached." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      )
    }

    const body = await req.json()
    const validatedData = createQuestionSchema.parse(body)

    const question = await createQuestion(validatedData)
    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get("status")

    const status =
      statusParam && Object.values(QuestionStatus).includes(statusParam as QuestionStatus)
        ? (statusParam as QuestionStatus)
        : undefined

    const filters: GetQuestionsFilters = {
      search: searchParams.get("search") || undefined,
      topic: searchParams.get("topic") || undefined,
      status,
      page: parseQueryInt(searchParams.get("page"), 1, 1, 100000),
      limit: parseQueryInt(searchParams.get("limit"), 20, 1, 100),
    }

    const result = await getQuestions(filters)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
