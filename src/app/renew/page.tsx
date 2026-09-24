import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function RenewPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect(`/login?callbackUrl=${encodeURIComponent("/insights")}`)
    }

    redirect("/insights")
}
