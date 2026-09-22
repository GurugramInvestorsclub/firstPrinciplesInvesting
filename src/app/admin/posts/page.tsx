import { client } from "@/lib/sanity.client"
import { adminAllPostsQuery } from "@/lib/sanity.queries"
import { PostsAdminClient, AdminPostItem } from "./PostsAdminClient"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminPostsPage() {
    if (!(await isAdminAuthenticated())) {
        redirect("/admin/login")
    }

    const posts = await client.fetch<AdminPostItem[]>(adminAllPostsQuery, {}, { cache: "no-store" })

    return <PostsAdminClient posts={posts || []} />
}
