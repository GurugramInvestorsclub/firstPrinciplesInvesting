import { getEligibleSubscribersWithActiveTenure } from "@/lib/insights-subscription-service"
import { prisma } from "@/lib/prisma"

export interface BrevoListSummary {
  id: number
  name: string
  uniqueSubscribers: number
  totalSubscribers: number
}

export interface BrevoSyncResult {
  success: boolean
  listId: number
  listName?: string
  totalEligibleInDb: number
  previouslyInBrevo: number
  addedCount: number
  removedCount: number
  retainedCount: number
  addedEmails: string[]
  removedEmails: string[]
  errors: string[]
}

export interface BrevoRegisteredUsersSyncResult {
  success: boolean
  listId: number
  listName?: string
  totalUsersInDb: number
  previouslyInBrevo: number
  addedCount: number
  retainedCount: number
  addedEmails: string[]
  errors: string[]
}

const DEFAULT_BREVO_MEMBERS_LIST_ID = 15
const DEFAULT_BREVO_REGISTERED_USERS_LIST_ID = 20

export function getBrevoApiKey(): string | null {
  return process.env.BREVO_API_KEY?.trim() || null
}

export function getBrevoActiveMembersListId(): number {
  const envVal = process.env.BREVO_ACTIVE_MEMBERS_LIST_ID
  if (envVal) {
    const parsed = parseInt(envVal.trim(), 10)
    if (!isNaN(parsed) && parsed > 0) {
      return parsed
    }
  }
  return DEFAULT_BREVO_MEMBERS_LIST_ID
}

export function getBrevoRegisteredUsersListId(): number {
  const envVal = process.env.BREVO_REGISTERED_USERS_LIST_ID
  if (envVal) {
    const parsed = parseInt(envVal.trim(), 10)
    if (!isNaN(parsed) && parsed > 0) {
      return parsed
    }
  }
  return DEFAULT_BREVO_REGISTERED_USERS_LIST_ID
}

/**
 * Fetch all contact lists configured in Brevo account
 */
export async function fetchBrevoLists(): Promise<BrevoListSummary[]> {
  const apiKey = getBrevoApiKey()
  if (!apiKey) {
    console.warn("BREVO_API_KEY is not configured.")
    return []
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts/lists?limit=50&offset=0", {
      method: "GET",
      headers: {
        "api-key": apiKey,
        accept: "application/json",
      },
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`Failed to fetch Brevo lists: ${res.status} - ${errText}`)
      return []
    }

    const data = await res.json()
    const lists = Array.isArray(data.lists) ? data.lists : []

    return lists.map((l: any) => ({
      id: l.id,
      name: l.name,
      uniqueSubscribers: l.uniqueSubscribers ?? 0,
      totalSubscribers: l.totalSubscribers ?? 0,
    }))
  } catch (error) {
    console.error("Error fetching Brevo lists:", error)
    return []
  }
}

/**
 * Splits a full name into First Name and Last Name for Brevo contact attributes
 */
function splitName(fullName?: string | null): { firstName: string; lastName: string } {
  if (!fullName || typeof fullName !== "string") {
    return { firstName: "", lastName: "" }
  }

  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  }
}

/**
 * Add or update a subscriber in the Brevo Active Members list.
 * Safe and non-blocking: logs errors without breaking purchase / checkout flow.
 */
export async function addSubscriberToBrevoActiveList(params: {
  email: string
  name?: string | null
  listId?: number
}): Promise<boolean> {
  const apiKey = getBrevoApiKey()
  const targetListId = params.listId || getBrevoActiveMembersListId()

  if (!apiKey) {
    console.warn("BREVO_API_KEY not configured. Skipping Brevo CRM contact sync.")
    return false
  }

  const normalizedEmail = params.email.trim().toLowerCase()
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    console.warn("Invalid email passed to addSubscriberToBrevoActiveList:", params.email)
    return false
  }

  const { firstName, lastName } = splitName(params.name)
  const attributes: Record<string, string> = {}
  if (firstName) attributes.FIRSTNAME = firstName
  if (lastName) attributes.LASTNAME = lastName

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email: normalizedEmail,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
        listIds: [targetListId],
        updateEnabled: true,
      }),
    })

    if (res.ok || res.status === 204 || res.status === 201) {
      return true
    }

    // If contact is already in list or created
    const body = await res.text()
    if (body.includes("duplicate_parameter") || body.includes("already exists")) {
      return true
    }

    console.error(`Brevo add contact failed (${res.status}): ${body}`)
    return false
  } catch (error) {
    console.error("Error adding contact to Brevo active members list:", error)
    return false
  }
}

/**
 * Remove a subscriber from the Brevo Active Members list (does not delete contact from Brevo CRM)
 */
export async function removeSubscriberFromBrevoActiveList(params: {
  email: string
  listId?: number
}): Promise<boolean> {
  const apiKey = getBrevoApiKey()
  const targetListId = params.listId || getBrevoActiveMembersListId()

  if (!apiKey) {
    return false
  }

  const normalizedEmail = params.email.trim().toLowerCase()
  if (!normalizedEmail) {
    return false
  }

  try {
    const res = await fetch(`https://api.brevo.com/v3/contacts/lists/${targetListId}/contacts/remove`, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        emails: [normalizedEmail],
      }),
    })

    if (res.ok || res.status === 204 || res.status === 200) {
      return true
    }

    const errText = await res.text()
    console.warn(`Brevo remove contact warning (${res.status}): ${errText}`)
    return false
  } catch (error) {
    console.error("Error removing contact from Brevo list:", error)
    return false
  }
}

/**
 * Fetches all contact emails currently present in a given Brevo list (with pagination)
 */
export async function fetchBrevoListContactEmails(listId: number): Promise<Set<string>> {
  const apiKey = getBrevoApiKey()
  const emails = new Set<string>()

  if (!apiKey) {
    return emails
  }

  let offset = 0
  const limit = 500
  let hasMore = true

  while (hasMore) {
    try {
      const res = await fetch(
        `https://api.brevo.com/v3/contacts/lists/${listId}/contacts?limit=${limit}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            "api-key": apiKey,
            accept: "application/json",
          },
        }
      )

      if (!res.ok) {
        const errText = await res.text()
        console.error(`Error fetching contacts from Brevo list ${listId}: ${res.status} - ${errText}`)
        break
      }

      const data = await res.json()
      const contacts = Array.isArray(data.contacts) ? data.contacts : []

      for (const contact of contacts) {
        if (contact.email && typeof contact.email === "string") {
          emails.add(contact.email.trim().toLowerCase())
        }
      }

      if (contacts.length < limit) {
        hasMore = false
      } else {
        offset += limit
      }
    } catch (err) {
      console.error("Error paginating Brevo list contacts:", err)
      break
    }
  }

  return emails
}

/**
 * Full reconciliation:
 * 1. Pulls all eligible subscribers whose tenure is currently active in the database
 *    (including subscribers whose renewal was cancelled but currentEndAt is still in the future).
 * 2. Fetches all contacts currently on the Brevo Active Members list.
 * 3. Adds newly active subscribers to the Brevo list with their name attributes.
 * 4. Removes contacts whose membership tenure has expired.
 */
export async function syncAllActiveTenureSubscribersToBrevo(options?: {
  listId?: number
}): Promise<BrevoSyncResult> {
  const targetListId = options?.listId || getBrevoActiveMembersListId()
  const apiKey = getBrevoApiKey()

  const result: BrevoSyncResult = {
    success: false,
    listId: targetListId,
    totalEligibleInDb: 0,
    previouslyInBrevo: 0,
    addedCount: 0,
    removedCount: 0,
    retainedCount: 0,
    addedEmails: [],
    removedEmails: [],
    errors: [],
  }

  if (!apiKey) {
    result.errors.push("BREVO_API_KEY is not configured")
    return result
  }

  try {
    // 1. Fetch eligible subscribers with active tenure from database
    const eligibleSubscribers = await getEligibleSubscribersWithActiveTenure()
    result.totalEligibleInDb = eligibleSubscribers.length

    const eligibleMap = new Map<string, { email: string; name: string | null }>()
    for (const sub of eligibleSubscribers) {
      if (sub.email) {
        eligibleMap.set(sub.email.toLowerCase().trim(), {
          email: sub.email.toLowerCase().trim(),
          name: sub.name,
        })
      }
    }

    // 2. Fetch current contacts in the Brevo list
    const currentBrevoEmails = await fetchBrevoListContactEmails(targetListId)
    result.previouslyInBrevo = currentBrevoEmails.size

    // 3. Compute differences
    const toAdd: Array<{ email: string; name: string | null }> = []
    const toRemove: string[] = []

    // Subscribers that should be in the list
    for (const [email, info] of eligibleMap.entries()) {
      if (!currentBrevoEmails.has(email)) {
        toAdd.push(info)
      } else {
        result.retainedCount++
      }
    }

    // Contacts in Brevo that are no longer eligible
    for (const email of currentBrevoEmails) {
      if (!eligibleMap.has(email)) {
        toRemove.push(email)
      }
    }

    // 4. Add missing subscribers in concurrent chunks
    const addChunkSize = 10
    for (let i = 0; i < toAdd.length; i += addChunkSize) {
      const chunk = toAdd.slice(i, i + addChunkSize)
      await Promise.all(
        chunk.map(async (subscriber) => {
          const ok = await addSubscriberToBrevoActiveList({
            email: subscriber.email,
            name: subscriber.name,
            listId: targetListId,
          })
          if (ok) {
            result.addedCount++
            result.addedEmails.push(subscriber.email)
          } else {
            result.errors.push(`Failed to add ${subscriber.email} to Brevo list ${targetListId}`)
          }
        })
      )
    }

    // 5. Remove expired contacts in batch of 50
    if (toRemove.length > 0) {
      const removeChunkSize = 50
      for (let i = 0; i < toRemove.length; i += removeChunkSize) {
        const batchEmails = toRemove.slice(i, i + removeChunkSize)
        try {
          const res = await fetch(
            `https://api.brevo.com/v3/contacts/lists/${targetListId}/contacts/remove`,
            {
              method: "POST",
              headers: {
                "api-key": apiKey,
                "content-type": "application/json",
                accept: "application/json",
              },
              body: JSON.stringify({
                emails: batchEmails,
              }),
            }
          )

          if (res.ok || res.status === 204 || res.status === 200) {
            result.removedCount += batchEmails.length
            result.removedEmails.push(...batchEmails)
          } else {
            const errText = await res.text()
            result.errors.push(`Failed batch removal: ${errText}`)
          }
        } catch (err: any) {
          result.errors.push(`Batch remove exception: ${err?.message || err}`)
        }
      }
    }

    result.success = true
    return result
  } catch (error: any) {
    console.error("syncAllActiveTenureSubscribersToBrevo failed:", error)
    result.errors.push(error?.message || "Sync failed due to an unexpected error")
    return result
  }
}

/**
 * Add or update a registered / logged in user in the Brevo Registered Users list.
 * Safe and non-blocking.
 */
export async function addSubscriberToBrevoRegisteredList(params: {
  email: string
  name?: string | null
  listId?: number
}): Promise<boolean> {
  const targetListId = params.listId || getBrevoRegisteredUsersListId()
  return addSubscriberToBrevoActiveList({
    email: params.email,
    name: params.name,
    listId: targetListId,
  })
}

/**
 * Sync all registered users in the database to the Brevo Registered Users list.
 * Identifies users present in DB but missing from the Brevo list and adds them.
 */
export async function syncAllRegisteredUsersToBrevo(options?: {
  listId?: number
}): Promise<BrevoRegisteredUsersSyncResult> {
  const targetListId = options?.listId || getBrevoRegisteredUsersListId()
  const apiKey = getBrevoApiKey()

  const result: BrevoRegisteredUsersSyncResult = {
    success: false,
    listId: targetListId,
    totalUsersInDb: 0,
    previouslyInBrevo: 0,
    addedCount: 0,
    retainedCount: 0,
    addedEmails: [],
    errors: [],
  }

  if (!apiKey) {
    result.errors.push("BREVO_API_KEY is not configured")
    return result
  }

  try {
    // 1. Fetch all registered users with an email
    const users = await prisma.user.findMany({
      where: {
        email: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    result.totalUsersInDb = users.length

    const usersMap = new Map<string, { email: string; name: string | null }>()
    for (const u of users) {
      if (u.email && u.email.trim().includes("@")) {
        const norm = u.email.trim().toLowerCase()
        if (!usersMap.has(norm)) {
          usersMap.set(norm, {
            email: norm,
            name: u.name,
          })
        }
      }
    }

    // 2. Fetch current contacts in the Brevo list
    const currentBrevoEmails = await fetchBrevoListContactEmails(targetListId)
    result.previouslyInBrevo = currentBrevoEmails.size

    // 3. Compute missing users to add
    const toAdd: Array<{ email: string; name: string | null }> = []
    for (const [email, info] of usersMap.entries()) {
      if (!currentBrevoEmails.has(email)) {
        toAdd.push(info)
      } else {
        result.retainedCount++
      }
    }

    // 4. Add missing users in concurrent chunks of 10
    const addChunkSize = 10
    for (let i = 0; i < toAdd.length; i += addChunkSize) {
      const chunk = toAdd.slice(i, i + addChunkSize)
      await Promise.all(
        chunk.map(async (user) => {
          const ok = await addSubscriberToBrevoActiveList({
            email: user.email,
            name: user.name,
            listId: targetListId,
          })
          if (ok) {
            result.addedCount++
            result.addedEmails.push(user.email)
          } else {
            result.errors.push(`Failed to add ${user.email} to Brevo list ${targetListId}`)
          }
        })
      )
    }

    result.success = true
    return result
  } catch (error: any) {
    console.error("syncAllRegisteredUsersToBrevo failed:", error)
    result.errors.push(error?.message || "Sync failed due to an unexpected error")
    return result
  }
}

