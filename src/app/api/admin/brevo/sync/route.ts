import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import {
  fetchBrevoLists,
  getBrevoActiveMembersListId,
  syncAllActiveTenureSubscribersToBrevo,
} from "@/lib/brevo-crm-service"
import { getEligibleSubscribersWithActiveTenure } from "@/lib/insights-subscription-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
  }

  try {
    const configuredListId = getBrevoActiveMembersListId()
    const [lists, eligibleSubscribers] = await Promise.all([
      fetchBrevoLists(),
      getEligibleSubscribersWithActiveTenure(),
    ])

    const currentList = lists.find((l) => l.id === configuredListId)

    return NextResponse.json({
      success: true,
      data: {
        configuredListId,
        configuredListName: currentList?.name || `List #${configuredListId}`,
        subscribersInBrevoList: currentList?.uniqueSubscribers ?? null,
        activeSubscribersInDb: eligibleSubscribers.length,
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
    try {
      const body = await request.json()
      if (body?.listId && typeof body.listId === "number") {
        listId = body.listId
      }
    } catch {
      // Body may be empty
    }

    const result = await syncAllActiveTenureSubscribersToBrevo(listId ? { listId } : undefined)

    return NextResponse.json({
      success: result.success,
      data: result,
    })
  } catch (error: any) {
    console.error("Failed to run manual Brevo sync:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Brevo sync failed" },
      { status: 500 }
    )
  }
}
