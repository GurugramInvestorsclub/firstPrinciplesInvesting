import { NextResponse } from "next/server"
import { updateQuestion, deleteQuestion } from "@/modules/questions/services/questionService"
import { updateQuestionSchema } from "@/modules/questions/validation/questionSchema"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { z } from "zod"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams
    const body = await req.json()
    const validatedData = updateQuestionSchema.parse(body)

    const updatedQuestion = await updateQuestion(id, validatedData)
    return NextResponse.json(updatedQuestion)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    await deleteQuestion(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
