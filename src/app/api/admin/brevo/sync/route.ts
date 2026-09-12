import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import {
  fetchBrevoLists,
  getBrevoActiveMembersListId,
  getBrevoRegisteredUsersListId,
  syncAllActiveTenureSubscribersToBrevo,
  syncAllRegisteredUsersToBrevo,
} from "@/lib/brevo-crm-service"
import { getEligibleSubscribersWithActiveTenure } from "@/lib/insights-subscription-service"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
  }

  try {
    const membersListId = getBrevoActiveMembersListId()
    const usersListId = getBrevoRegisteredUsersListId()

    const [lists, eligibleSubscribers, totalRegisteredUsers] = await Promise.all([
      fetchBrevoLists(),
      getEligibleSubscribersWithActiveTenure(),
      prisma.user.count({ where: { email: { not: null } } }),
    ])

    const membersList = lists.find((l) => l.id === membersListId)
    const usersList = lists.find((l) => l.id === usersListId)

    return NextResponse.json({
      success: true,
      data: {
        members: {
          configuredListId: membersListId,
          configuredListName: membersList?.name || `List #${membersListId}`,
          subscribersInBrevoList: membersList?.uniqueSubscribers ?? null,
          activeCountInDb: eligibleSubscribers.length,
        },
        registeredUsers: {
          configuredListId: usersListId,
          configuredListName: usersList?.name || `List #${usersListId}`,
          subscribersInBrevoList: usersList?.uniqueSubscribers ?? null,
          registeredCountInDb: totalRegisteredUsers,
        },
        availableLists: lists,
      },
    })
  } catch (error: any) {
    console.error("Failed to load Brevo sync status:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load Brevo status" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
  }

  try {
    let listId: number | undefined = undefined
    let syncType: "members" | "registered_users" = "members"

    try {
      const body = await request.json()
      if (body?.listId && typeof body.listId === "number") {
        listId = body.listId
      }
      if (body?.type === "registered_users") {
        syncType = "registered_users"
      }
    } catch {
      // Body may be empty
    }

    if (syncType === "registered_users") {
      const result = await syncAllRegisteredUsersToBrevo(listId ? { listId } : undefined)
      return NextResponse.json({
        success: result.success,
        data: result,
      })
    } else {
      const result = await syncAllActiveTenureSubscribersToBrevo(listId ? { listId } : undefined)
      return NextResponse.json({
        success: result.success,
        data: result,
      })
    }
  } catch (error: any) {
    console.error("Failed to run manual Brevo sync:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Brevo sync failed" },
      { status: 500 }
    )
  }
}
