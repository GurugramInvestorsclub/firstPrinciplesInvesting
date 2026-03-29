import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDailyQuestionReport } from "@/lib/question-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        const cronSecret = process.env.CRON_SECRET;

        // Security check
        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Fetch new questions from the last 24 hours
        const newQuestions = await prisma.question.findMany({
            where: {
                createdAt: {
                    gte: yesterday
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        if (newQuestions.length === 0) {
            return NextResponse.json({ 
                success: true, 
                message: "No new questions in the last 24 hours. Email not sent." 
            });
        }

        const emailSent = await sendDailyQuestionReport(newQuestions);

        if (!emailSent) {
            return NextResponse.json({ 
                success: false, 
                error: "Failed to send email report." 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully sent report for ${newQuestions.length} questions.` 
        });

    } catch (error) {
        console.error("Cron job error:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
