import { LegalPageLayout } from "@/components/layout/LegalPageLayout"
import { LegalAccordion } from "@/components/ui/legal-accordion"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Refund & Cancellation Policy | First Principles Investing",
    description: "Refund and Cancellation Policy for First Principles Investing. Learn about our refund eligibility, process, and cancellation terms.",
}

export default function RefundPage() {
    return (
        <LegalPageLayout
            title="Refund & Cancellation Policy"
            lastUpdated="February 16, 2026"
        >
            <div className="mb-12 text-sm text-neutral-400 font-mono">
                <p>Website: www.firstprinciplesinvesting.in</p>
                <p>Legal Entity: Athletico Analytic Services LLP</p>
                <p>Brand Name: First Principles Investing</p>
            </div>

            <div className="mb-16">
                <h2 className="text-xl md:text-2xl font-semibold tracking-wide text-[#F0EDE8] mb-6">1. INTRODUCTION</h2>
                <p className="text-neutral-300 leading-relaxed mb-4">
                    This Refund and Cancellation Policy governs the refund and cancellation of courses, workshops, and programs offered
                    by Athletico Analytic Services LLP (“we,” “us,” “our,” or “Company”) operating under the brand name “First Principles
                    Investing.”
                </p>
                <p className="text-neutral-300 leading-relaxed mb-4">This policy complies with:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral-300 mb-4">
                    <li>Consumer Protection Act, 2019</li>
                    <li>Reserve Bank of India (RBI) Guidelines on Digital Payments</li>
                    <li>Information Technology Act, 2000</li>
                    <li>E-commerce Rules, 2020</li>
                </ul>
                <p className="text-neutral-300 leading-relaxed">
                    By enrolling in our courses or purchasing our services, you agree to this Refund and Cancellation Policy.
                </p>
            </div>

            <LegalAccordion items={[
                {
                    id: "2",
                    title: "2. SCOPE OF POLICY",
                    content: (
                        <>
                            <p>This policy applies to:</p>
                            <ul>
                                <li>Sectoral/Topic-specific Workshops and Events</li>
                                <li>Intensive Programs (4-week weekend programs)</li>
                                <li>Any other educational courses or programs offered on our platform</li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "3",
                    title: "3. REFUND ELIGIBILITY",
                    content: (
                        <>
                            <h3>3.1 Sectoral/Topic Workshops and Events</h3>
                            <ul>
                                <li><strong>Refund Window:</strong> 24 hours post-event/workshop</li>
                                <li><strong>Eligibility:</strong>
                                    <ul>
                                        <li>You may request a refund within 24 hours after the completion of a sectoral or topic-specific workshop or event</li>
                                        <li>The refund request must be submitted in writing via email to <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a></li>
                                        <li>The full amount paid will be refunded if the request is made within the 24-hour window</li>
                                    </ul>
                                </li>
                                <li><strong>Non-Refundable After:</strong> 24 hours from the event/workshop conclusion</li>
                            </ul>

                            <h3>3.2 Intensive Programs (4-Week Weekend Programs)</h3>
                            <ul>
                                <li><strong>Refund Window:</strong> Until the end of the batch</li>
                                <li><strong>Eligibility:</strong>
                                    <ul>
                                        <li>You may request a refund at any time until the end of the batch</li>
                                        <li>Refunds are subject to any changes in program terms or conditions</li>
                                        <li>The refund request must be submitted in writing via email to <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a></li>
                                        <li>The refund amount will be calculated based on the remaining portion of the program</li>
                                    </ul>
                                </li>
                                <li><strong>Important Note:</strong>
                                    <ul>
                                        <li>If you have attended a portion of the Intensive Program, the refund will be calculated on a pro-rata basis for the unused portion</li>
                                        <li>The Company reserves the right to modify refund eligibility based on program-specific terms communicated at the time of enrollment</li>
                                    </ul>
                                </li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "4",
                    title: "4. HOW TO REQUEST A REFUND",
                    content: (
                        <>
                            <p>To request a refund, please follow these steps:</p>
                            <ul>
                                <li><strong>Step 1:</strong> Send an email to <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a> with the subject line “Refund Request”</li>
                                <li><strong>Step 2:</strong> Include the following information in your email:
                                    <ul>
                                        <li>Your full name</li>
                                        <li>Email address used for registration</li>
                                        <li>Phone number</li>
                                        <li>Transaction ID or Order ID</li>
                                        <li>Course/Workshop/Program name</li>
                                        <li>Date of purchase</li>
                                        <li>Reason for refund (optional but helpful)</li>
                                    </ul>
                                </li>
                                <li><strong>Step 3:</strong> Our team will review your request and respond within 2 business days</li>
                                <li><strong>Step 4:</strong> If approved, the refund will be processed to your original payment method</li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "5",
                    title: "5. REFUND PROCESSING TIME",
                    content: (
                        <>
                            <h3>5.1 Timeline</h3>
                            <p>In accordance with Reserve Bank of India (RBI) guidelines for digital payment transactions:</p>
                            <ul>
                                <li><strong>Refund Initiation:</strong> Within 5 business days (T+5) of approval</li>
                                <li><strong>Credit to Account:</strong> 5-10 business days after initiation, depending on your bank or payment method</li>
                            </ul>
                            <p><strong>Total Processing Time:</strong> Typically 7-15 business days from approval</p>

                            <h3>5.2 Payment Method</h3>
                            <p>Refunds will be processed to the original payment method used for the transaction:</p>
                            <ul>
                                <li>Credit Card: 5-10 business days</li>
                                <li>Debit Card: 5-10 business days</li>
                                <li>UPI: 2-5 business days</li>
                                <li>Net Banking: 5-10 business days</li>
                                <li>Digital Wallets: 2-5 business days</li>
                            </ul>

                            <h3>5.3 Payment Gateway Charges</h3>
                            <p>
                                There are no cancellation or processing fees deducted from your refund amount. You will receive a full refund of the
                                amount paid (excluding any payment gateway charges that were originally borne by you, if applicable).
                            </p>
                        </>
                    )
                },
                {
                    id: "6",
                    title: "6. NON-REFUNDABLE CIRCUMSTANCES",
                    content: (
                        <>
                            <p>Refunds will not be provided in the following circumstances:</p>

                            <h3>6.1 Time Limitations</h3>
                            <ul>
                                <li>Requests made after the specified refund window for the respective program/workshop</li>
                                <li>For Sectoral/Topic Workshops: Requests made more than 24 hours after the event conclusion</li>
                                <li>For programs that have been fully completed</li>
                            </ul>

                            <h3>6.2 Violation of Terms</h3>
                            <ul>
                                <li>If you have violated our Terms of Service</li>
                                <li>If you have engaged in fraudulent activity</li>
                                <li>If you have misused course content or violated intellectual property rights</li>
                            </ul>

                            <h3>6.3 Technical Issues on User End</h3>
                            <ul>
                                <li>Internet connectivity issues on your end</li>
                                <li>Device compatibility issues that are not related to our platform</li>
                                <li>Failure to access the program due to incorrect login credentials (unless we are unable to resolve the issue)</li>
                            </ul>

                            <h3>6.4 Partial Completion</h3>
                            <ul>
                                <li>If you have accessed and completed a significant portion of the program (for Intensive Programs, the Company will evaluate on a case-by-case basis)</li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "7",
                    title: "7. CANCELLATION POLICY",
                    content: (
                        <>
                            <h3>7.1 Cancellation by User</h3>
                            <p>
                                You may cancel your enrollment at any time by sending an email to <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a>. Cancellation
                                requests are subject to the refund eligibility criteria outlined in Section 3.
                            </p>

                            <h3>7.2 Cancellation by Company</h3>
                            <p>We reserve the right to cancel or reschedule any course, workshop, or program due to:</p>
                            <ul>
                                <li>Insufficient enrollments</li>
                                <li>Instructor unavailability</li>
                                <li>Technical difficulties</li>
                                <li>Force majeure events (natural disasters, pandemics, government restrictions, etc.)</li>
                            </ul>
                            <p>In the event of cancellation by the Company:</p>
                            <ul>
                                <li>You will be notified via email and phone</li>
                                <li>You will receive a full refund of the amount paid, processed within 5-7 business days</li>
                                <li>Alternatively, you may choose to transfer your enrollment to a future batch or an alternative program of equivalent value</li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "8",
                    title: "8. FAILED TRANSACTIONS AND PAYMENT ISSUES",
                    content: (
                        <>
                            <h3>8.1 Payment Deducted but Enrollment Not Confirmed</h3>
                            <p>If your payment has been deducted from your account but you have not received enrollment confirmation:</p>
                            <ul>
                                <li>Contact us immediately at <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a> with your transaction details</li>
                                <li>We will investigate and resolve the issue within 48 hours</li>
                                <li>If the payment was received by us, your enrollment will be confirmed</li>
                                <li>If the payment was not received by us, the amount will be automatically refunded by the payment gateway within 5-7 business days</li>
                            </ul>

                            <h3>8.2 Duplicate Payments</h3>
                            <p>If you have been charged multiple times for the same transaction:</p>
                            <ul>
                                <li>Contact us immediately with proof of duplicate charges</li>
                                <li>We will process a refund for the duplicate payment within 5 business days</li>
                            </ul>

                            <h3>8.3 Payment Gateway Failures</h3>
                            <p>In case of payment gateway errors or technical glitches:</p>
                            <ul>
                                <li>The refund will be processed automatically by the payment gateway (Razorpay) within 5-7 business days</li>
                                <li>If the refund is not processed automatically, contact us with transaction details</li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "9",
                    title: "9. REFUND FOR DEFECTIVE OR NON-DELIVERY OF SERVICE",
                    content: (
                        <>
                            <h3>9.1 Defective Service</h3>
                            <p>If you experience technical issues that prevent you from accessing the course content:</p>
                            <ul>
                                <li>Report the issue immediately to <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a></li>
                                <li>Our team will work to resolve the technical issue within 48 hours</li>
                                <li>If we are unable to resolve the issue within a reasonable time, you will be eligible for a full refund</li>
                            </ul>

                            <h3>9.2 Service Not Delivered as Described</h3>
                            <p>If the course or program delivered does not match the description provided on our website:</p>
                            <ul>
                                <li>Contact us within 7 days of the program start date</li>
                                <li>Provide specific details about the discrepancy</li>
                                <li>We will investigate and, if the claim is verified, offer a full refund or transfer to an alternative program</li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "10",
                    title: "10. CONSUMER RIGHTS",
                    content: (
                        <>
                            <p>Under the Consumer Protection Act, 2019, you have the right to:</p>
                            <ul>
                                <li>Receive a refund for defective products or services</li>
                                <li>Seek compensation for deficiency in service</li>
                                <li>File a consumer complaint with the appropriate consumer forum</li>
                            </ul>
                            <p>If you are not satisfied with our refund resolution, you may file a complaint with:</p>
                            <ul>
                                <li>National Consumer Helpline: 1800-11-4000 or via the NCH Mobile App</li>
                                <li>Consumer Forum: Your local District, State, or National Consumer Disputes Redressal Commission</li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "11",
                    title: "11. FORCE MAJEURE",
                    content: (
                        <>
                            <p>
                                We shall not be liable for any failure or delay in providing services or processing refunds due to circumstances beyond
                                our reasonable control, including but not limited to:
                            </p>
                            <ul>
                                <li>Natural disasters (earthquakes, floods, storms, etc.)</li>
                                <li>Pandemics or epidemics</li>
                                <li>Government actions or restrictions</li>
                                <li>War, terrorism, or civil unrest</li>
                                <li>Internet or telecommunications failures</li>
                                <li>Power outages</li>
                            </ul>
                            <p>
                                In such circumstances, we will make reasonable efforts to notify you and provide alternative solutions or refunds as
                                appropriate.
                            </p>
                        </>
                    )
                },
                {
                    id: "12",
                    title: "12. MODIFICATIONS TO THIS POLICY",
                    content: (
                        <>
                            <p>
                                We reserve the right to modify this Refund and Cancellation Policy at any time. Changes will be effective immediately
                                upon posting on our website. The “Last Updated” date at the top of this policy will be revised accordingly.
                            </p>
                            <p>
                                Your continued use of our services after changes to this policy constitutes your acceptance of the updated terms.
                                We encourage you to review this policy periodically to stay informed about our refund and cancellation practices.
                            </p>
                        </>
                    )
                },
                {
                    id: "13",
                    title: "13. DISPUTE RESOLUTION",
                    content: (
                        <>
                            <h3>13.1 Internal Resolution</h3>
                            <p>If you have any dispute regarding refunds or cancellations, please contact our Grievance Officer first:</p>
                            <p>
                                <strong>Grievance Officer:</strong> Support Team<br />
                                <strong>Email:</strong> <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a><br />
                                <strong>Phone:</strong> +91 7011186177<br />
                                <strong>Address:</strong> 906, Sector 40, Gurugram - 122002, Haryana, India
                            </p>
                            <p>We will make every effort to resolve your dispute amicably within 15 days.</p>

                            <h3>13.2 Legal Jurisdiction</h3>
                            <p>
                                This Refund and Cancellation Policy shall be governed by and construed in accordance with the laws of India. Any
                                disputes arising out of or in connection with this policy shall be subject to the exclusive jurisdiction of the courts in
                                Gurugram, Haryana, India.
                            </p>
                        </>
                    )
                },
                {
                    id: "14",
                    title: "14. CONTACT INFORMATION",
                    content: (
                        <>
                            <p>For any questions or concerns regarding this Refund and Cancellation Policy, please contact us:</p>
                            <p>
                                <strong>Email:</strong> <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a><br />
                                <strong>Phone:</strong> +91 7011186177<br />
                                <strong>Address:</strong> Athletico Analytic Services LLP, 906, Sector 40, Gurugram - 122002, Haryana, India<br />
                                <strong>Business Hours:</strong> Monday to Friday, 10:00 AM to 6:00 PM IST<br />
                                (We strive to respond to all inquiries within 24-48 hours)
                            </p>
                        </>
                    )
                }
            ]} />

            <div className="mt-16 border-t border-neutral-800 pt-8">
                <h2 className="text-xl md:text-2xl font-semibold tracking-wide text-[#F0EDE8] mb-6">15. ACKNOWLEDGMENT</h2>
                <div className="prose prose-invert max-w-none text-neutral-300">
                    <p className="mb-4">By enrolling in our courses or purchasing our services, you acknowledge that:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>You have read and understood this Refund and Cancellation Policy</li>
                        <li>You agree to be bound by the terms and conditions outlined herein</li>
                        <li>You understand your rights and obligations regarding refunds and cancellations</li>
                    </ul>

                    <h3 className="text-lg font-medium text-[#F0EDE8] mt-8 mb-4">Important Notes:</h3>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>All refund requests must be submitted in writing via email</li>
                        <li>Refunds are processed only to the original payment method</li>
                        <li>Processing fees, if any, charged by payment gateways may be non-refundable</li>
                        <li>This policy does not affect your statutory rights under Indian consumer protection laws</li>
                        <li>In case of any conflict between this policy and applicable laws, the provisions of applicable laws shall prevail</li>
                    </ol>
                </div>

                <p className="mt-8 text-neutral-300">Thank you for choosing First Principles Investing for your financial education needs.</p>
            </div>
        </LegalPageLayout>
    )
}
