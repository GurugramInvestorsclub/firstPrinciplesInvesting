import { Question } from "@prisma/client";

export async function sendDailyQuestionReport(questions: Question[]) {
    const brevoApiKey = process.env.BREVO_API_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || "support@firstprinciplesresearch.in";
    const recipient = "rahul@firstprinciplesresearch.in";

    if (!brevoApiKey && !resendApiKey) {
        console.error("Neither BREVO_API_KEY nor RESEND_API_KEY is configured.");
        return false;
    }

    const questionRows = questions.map(q => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px; vertical-align: top;">
                <strong>${q.name || "Anonymous"}</strong><br/>
                <span style="color: #666; font-size: 12px;">${q.email || "No Email"}</span>
            </td>
            <td style="padding: 12px; vertical-align: top;">
                <span style="display: inline-block; padding: 2px 8px; background: #f0f0f0; border-radius: 4px; font-size: 11px; text-transform: uppercase;">${q.topic}</span>
            </td>
            <td style="padding: 12px; vertical-align: top;">
                ${q.question}
            </td>
            <td style="padding: 12px; vertical-align: top; color: #999; font-size: 12px;">
                ${new Date(q.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
            </td>
        </tr>
    `).join("");

    const subject = `Daily Question Report: ${questions.length} new questions`;
    const html = `
        <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #000; border-bottom: 2px solid #FFC72C; padding-bottom: 10px;">Daily Question Report</h2>
            <p>You have received <strong>${questions.length}</strong> new questions in the last 24 hours.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                <thead>
                    <tr style="background: #f9f9f9; text-align: left;">
                        <th style="padding: 12px; border-bottom: 2px solid #eee;">User</th>
                        <th style="padding: 12px; border-bottom: 2px solid #eee;">Topic</th>
                        <th style="padding: 12px; border-bottom: 2px solid #eee;">Question</th>
                        <th style="padding: 12px; border-bottom: 2px solid #eee;">Received At</th>
                    </tr>
                </thead>
                <tbody>
                    ${questionRows}
                </tbody>
            </table>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                <p>This is an automated report from First Principles Investing.</p>
            </div>
        </div>
    `;

    if (brevoApiKey) {
        try {
            const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "api-key": brevoApiKey,
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    sender: {
                        name: "First Principles Investing",
                        email: emailFrom,
                    },
                    to: [
                        {
                            email: recipient,
                        },
                    ],
                    subject,
                    htmlContent: html,
                }),
            });

            if (response.ok) {
                return true;
            }

            const error = await response.text();
            console.error(`Brevo API error (${response.status}):`, error);
        } catch (err) {
            console.error("Failed to send daily question report via Brevo:", err);
        }
    }

    if (resendApiKey) {
        try {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${resendApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: emailFrom,
                    to: [recipient],
                    subject,
                    html: html,
                }),
            });

            if (response.ok) {
                return true;
            }

            const error = await response.json();
            console.error("Resend API error:", error);
        } catch (err) {
            console.error("Failed to send daily question report via Resend:", err);
        }
    }

    return false;
}
