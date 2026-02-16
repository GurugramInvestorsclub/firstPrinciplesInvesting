import { LegalPageLayout } from "@/components/layout/LegalPageLayout"
import { LegalAccordion } from "@/components/ui/legal-accordion"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Terms of Service | First Principles Investing",
    description: "Terms of Service for First Principles Investing. Read our legal agreement, user rights, and obligations.",
}

export default function TermsPage() {
    return (
        <LegalPageLayout
            title="Terms of Service"
            lastUpdated="February 16, 2026"
        >
            <div className="mb-12 text-sm text-neutral-400 font-mono">
                <p>Website: www.firstprinciplesinvesting.in</p>
                <p>Legal Entity: Athletico Analytic Services LLP</p>
                <p>Brand Name: First Principles Investing</p>
            </div>

            <div className="mb-16">
                <h2 className="text-xl md:text-2xl font-semibold tracking-wide text-[#F0EDE8] mb-6">1. INTRODUCTION AND ACCEPTANCE OF TERMS</h2>
                <p className="text-neutral-300 leading-relaxed mb-6">
                    Welcome to First Principles Investing, operated by Athletico Analytic Services LLP (“we,” “us,” “our,” or “Company”).
                    These Terms of Service (“Terms”) constitute a legally binding agreement between you (“you,” “your,” or “user”) and the
                    Company governing your access to and use of our website www.firstprinciplesinvesting.in (the “Website”) and all
                    related services, content, and products (collectively, the “Services”).
                </p>

                <h3 className="text-lg font-medium text-[#F0EDE8] mb-3">1.1 Agreement to Terms</h3>
                <p className="text-neutral-300 leading-relaxed mb-6">
                    By accessing, browsing, or using our Website or Services, you acknowledge that you have read, understood, and agree
                    to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not access or use our
                    Services.
                </p>

                <h3 className="text-lg font-medium text-[#F0EDE8] mb-3">1.2 Legal Framework</h3>
                <p className="text-neutral-300 leading-relaxed mb-3">These Terms are governed by and comply with:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral-300 mb-6">
                    <li>Indian Contract Act, 1872</li>
                    <li>Information Technology Act, 2000</li>
                    <li>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</li>
                    <li>Consumer Protection Act, 2019</li>
                    <li>Digital Personal Data Protection Act, 2023</li>
                </ul>

                <h3 className="text-lg font-medium text-[#F0EDE8] mb-3">1.3 Eligibility</h3>
                <p className="text-neutral-300 leading-relaxed mb-3">
                    You must be at least 18 years of age and legally competent to enter into a binding contract under applicable law to use
                    our Services. By using our Services, you represent and warrant that you meet these requirements.
                </p>
                <p className="text-neutral-300 leading-relaxed">
                    If you are accessing our Services on behalf of a company or organization, you represent that you have the authority to
                    bind that entity to these Terms.
                </p>
            </div>

            <LegalAccordion items={[
                {
                    id: "2",
                    title: "2. DESCRIPTION OF SERVICES",
                    content: (
                        <>
                            <p>
                                First Principles Investing provides educational services related to financial planning, personal finance, and financial
                                literacy, including but not limited to:
                            </p>
                            <ul>
                                <li>Online financial literacy courses</li>
                                <li>Sectoral and topic-specific workshops</li>
                                <li>Intensive programs (multi-week educational programs)</li>
                                <li>Educational content, articles, and resources</li>
                                <li>Webinars and live events</li>
                            </ul>
                            <div className="bg-[#1A1A1A] p-6 border-l-4 border-[#C6A84A] my-8 rounded-r-lg">
                                <p className="font-bold text-[#C6A84A] text-lg mb-2">Important Disclaimer:</p>
                                <p className="text-neutral-300">
                                    Our Services are for educational purposes only. We do not provide investment advice, financial
                                    planning services, or personalized financial recommendations. You should consult with a qualified financial advisor
                                    before making any investment decisions.
                                </p>
                            </div>
                        </>
                    )
                },
                {
                    id: "3",
                    title: "3. USER ACCOUNTS AND REGISTRATION",
                    content: (
                        <>
                            <h3>3.1 Account Creation</h3>
                            <p>
                                Currently, user accounts are not required to access our Services. However, we reserve the right to implement user
                                registration in the future. If and when account creation becomes available, you will be required to:
                            </p>
                            <ul>
                                <li>Provide accurate, current, and complete information</li>
                                <li>Maintain and promptly update your account information</li>
                                <li>Maintain the security of your account credentials</li>
                                <li>Accept responsibility for all activities under your account</li>
                            </ul>

                            <h3>3.2 Account Security</h3>
                            <p>
                                You are responsible for maintaining the confidentiality of your account information and password (if applicable). You
                                agree to notify us immediately of any unauthorized access or use of your account.
                            </p>
                        </>
                    )
                },
                {
                    id: "4",
                    title: "4. COURSE ENROLLMENT AND ACCESS",
                    content: (
                        <>
                            <h3>4.1 Course Purchase</h3>
                            <p>When you enroll in a course, workshop, or program:</p>
                            <ul>
                                <li>You must provide accurate contact and payment information</li>
                                <li>Payment must be completed before access to the course is granted</li>
                                <li>Course fees are as displayed on the Website at the time of enrollment</li>
                                <li>All prices are in Indian Rupees (INR) unless otherwise stated</li>
                            </ul>

                            <h3>4.2 Course Access</h3>
                            <ul>
                                <li>Access to course materials is granted upon successful payment</li>
                                <li>Course access may be time-limited as specified in the course description</li>
                                <li>We reserve the right to modify, suspend, or discontinue any course or program at any time</li>
                                <li>In the event of course cancellation by us, you will receive a full refund or the option to transfer to an alternative program</li>
                            </ul>

                            <h3>4.3 Course Content</h3>
                            <ul>
                                <li>Course content, including videos, materials, and resources, are for your personal, non-commercial use only</li>
                                <li>You may not share, distribute, reproduce, or resell course content</li>
                                <li>We may update or modify course content at any time to improve quality or accuracy</li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "5",
                    title: "5. PAYMENT TERMS",
                    content: (
                        <>
                            <h3>5.1 Payment Processing</h3>
                            <ul>
                                <li>Payments are processed through Razorpay, a third-party payment gateway</li>
                                <li>We accept credit cards, debit cards, UPI, net banking, and digital wallets</li>
                                <li>By providing payment information, you authorize us to charge the applicable fees to your chosen payment method</li>
                            </ul>

                            <h3>5.2 Pricing and Taxes</h3>
                            <ul>
                                <li>All course fees are clearly displayed on the Website</li>
                                <li>Prices are subject to change, but changes will not affect enrollments already purchased</li>
                                <li>Applicable taxes (GST) will be added to the course fee as required by law</li>
                                <li>You are responsible for any additional bank charges or payment gateway fees</li>
                            </ul>

                            <h3>5.3 Billing</h3>
                            <ul>
                                <li>You will receive a payment confirmation via email after successful payment</li>
                                <li>An invoice/receipt will be provided for all transactions</li>
                                <li>For any billing inquiries, contact <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a></li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "6",
                    title: "6. REFUNDS AND CANCELLATIONS",
                    content: (
                        <>
                            <p>
                                Please refer to our separate Refund and Cancellation Policy for detailed information about:
                            </p>
                            <ul>
                                <li>Refund eligibility and timelines</li>
                                <li>Cancellation procedures</li>
                                <li>Non-refundable circumstances</li>
                                <li>Processing times</li>
                            </ul>
                            <p>The Refund and Cancellation Policy is incorporated into these Terms by reference.</p>
                        </>
                    )
                },
                {
                    id: "7",
                    title: "7. INTELLECTUAL PROPERTY RIGHTS",
                    content: (
                        <>
                            <h3>7.1 Our Content</h3>
                            <p>
                                All content on the Website and in our courses, including but not limited to text, graphics, logos, images, videos, audio,
                                software, and course materials (collectively, “Content”), is the property of Athletico Analytic Services LLP or its
                                licensors and is protected by:
                            </p>
                            <ul>
                                <li>Copyright Act, 1957</li>
                                <li>Trademark Act, 1999</li>
                                <li>Information Technology Act, 2000</li>
                                <li>International intellectual property laws</li>
                            </ul>

                            <h3>7.2 Limited License</h3>
                            <p>We grant you a limited, non-exclusive, non-transferable, revocable license to:</p>
                            <ul>
                                <li>Access and view the Website for personal, non-commercial use</li>
                                <li>Access and use course materials for your personal educational purposes only</li>
                            </ul>

                            <h3>7.3 Restrictions</h3>
                            <p>You may not:</p>
                            <ul>
                                <li>Copy, reproduce, modify, distribute, or create derivative works from our Content</li>
                                <li>Download course videos or materials (except where explicitly permitted)</li>
                                <li>Share your course access with others</li>
                                <li>Use our Content for commercial purposes</li>
                                <li>Remove or alter any copyright, trademark, or proprietary notices</li>
                                <li>Reverse engineer, decompile, or disassemble any software or technology used on the Website</li>
                            </ul>

                            <h3>7.4 Trademarks</h3>
                            <p>
                                “First Principles Investing” and all related logos, service marks, and trade names are trademarks of Athletico Analytic
                                Services LLP. You may not use our trademarks without our prior written consent.
                            </p>

                            <h3>7.5 User-Generated Content</h3>
                            <p>If you submit any content, feedback, suggestions, or materials to us (collectively, “User Content”):</p>
                            <ul>
                                <li>You grant us a worldwide, royalty-free, perpetual, irrevocable license to use, reproduce, modify, and distribute such User Content</li>
                                <li>You represent that you own or have the right to submit such User Content</li>
                                <li>You waive any moral rights in the User Content</li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "8",
                    title: "8. USER CONDUCT AND PROHIBITED ACTIVITIES",
                    content: (
                        <>
                            <h3>8.1 Acceptable Use</h3>
                            <p>You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                            <ul>
                                <li>Violate any applicable laws, regulations, or third-party rights</li>
                                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                                <li>Engage in any fraudulent, deceptive, or misleading activities</li>
                                <li>Interfere with or disrupt the integrity or performance of the Website</li>
                                <li>Attempt to gain unauthorized access to our systems or networks</li>
                                <li>Use automated systems (bots, scrapers, etc.) to access the Website</li>
                                <li>Transmit viruses, malware, or any harmful code</li>
                                <li>Harass, abuse, or harm other users or our staff</li>
                                <li>Share login credentials or course access with unauthorized users</li>
                                <li>Post or transmit offensive, defamatory, or inappropriate content</li>
                            </ul>

                            <h3>8.2 Consequences of Violation</h3>
                            <p>Violation of these Terms may result in:</p>
                            <ul>
                                <li>Immediate termination of your access to the Services</li>
                                <li>Legal action and liability for damages</li>
                                <li>Reporting to appropriate law enforcement authorities</li>
                                <li>No refund of any fees paid</li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "9",
                    title: "9. DISCLAIMERS AND LIMITATIONS OF LIABILITY",
                    content: (
                        <>
                            <h3>9.1 Educational Purpose Only</h3>
                            <p><strong>IMPORTANT:</strong> Our Services are for educational purposes only. We do not provide:</p>
                            <ul>
                                <li>Investment advice or recommendations</li>
                                <li>Financial planning or advisory services</li>
                                <li>Tax, legal, or accounting advice</li>
                                <li>Guarantees of financial success or investment returns</li>
                            </ul>
                            <p>You should consult with qualified professionals before making any financial decisions.</p>

                            <h3>9.2 No Warranties</h3>
                            <p>
                                THE WEBSITE AND SERVICES ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS WITHOUT WARRANTIES OF
                                ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                            </p>
                            <ul>
                                <li>Warranties of merchantability or fitness for a particular purpose</li>
                                <li>Warranties of accuracy, reliability, or completeness of content</li>
                                <li>Warranties of uninterrupted or error-free operation</li>
                                <li>Warranties that the Website is free from viruses or harmful components</li>
                            </ul>

                            <h3>9.3 Limitation of Liability</h3>
                            <p>
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, ATHLETICO ANALYTIC SERVICES LLP SHALL NOT BE LIABLE FOR
                                ANY:
                            </p>
                            <ul>
                                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                                <li>Loss of profits, revenue, data, or business opportunities</li>
                                <li>Damages resulting from your use or inability to use the Services</li>
                                <li>Damages resulting from unauthorized access to your account or data</li>
                                <li>Damages resulting from errors, omissions, or inaccuracies in content</li>
                            </ul>
                            <p>
                                OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICES SHALL
                                NOT EXCEED THE AMOUNT YOU PAID TO US IN THE SIX (6) MONTHS PRECEDING THE CLAIM.
                            </p>

                            <h3>9.4 Basis of the Bargain</h3>
                            <p>
                                You acknowledge that the disclaimers and limitations of liability set forth in this Section 9 are fundamental elements of
                                the agreement between you and the Company, and that we would not be able to provide the Services on an
                                economically reasonable basis without these limitations.
                            </p>
                        </>
                    )
                },
                {
                    id: "10",
                    title: "10. INDEMNIFICATION",
                    content: (
                        <>
                            <p>
                                You agree to indemnify, defend, and hold harmless Athletico Analytic Services LLP, its affiliates, officers, directors,
                                employees, agents, and licensors from and against any and all claims, liabilities, damages, losses, costs, expenses
                                (including reasonable attorneys’ fees) arising out of or related to:
                            </p>
                            <ul>
                                <li>Your use or misuse of the Services</li>
                                <li>Your violation of these Terms</li>
                                <li>Your violation of any third-party rights, including intellectual property rights</li>
                                <li>Your violation of any applicable laws or regulations</li>
                                <li>Any User Content you submit or transmit</li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "11",
                    title: "11. PRIVACY AND DATA PROTECTION",
                    content: (
                        <>
                            <h3>11.1 Privacy Policy</h3>
                            <p>
                                Your use of our Services is also governed by our Privacy Policy, which is incorporated into these Terms by reference.
                                Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
                            </p>

                            <h3>11.2 Data Collection</h3>
                            <p>By using our Services, you consent to:</p>
                            <ul>
                                <li>Collection of personal information as described in our Privacy Policy</li>
                                <li>Use of cookies and tracking technologies</li>
                                <li>Processing of payment information by our payment gateway provider</li>
                                <li>Receiving marketing communications (you may opt out at any time)</li>
                            </ul>

                            <h3>11.3 Grievance Redressal</h3>
                            <p>For any privacy concerns or complaints, please contact our Grievance Officer:</p>
                            <p>
                                <strong>Grievance Officer:</strong> Support Team<br />
                                <strong>Email:</strong> <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a><br />
                                <strong>Phone:</strong> +91 7011186177<br />
                                <strong>Address:</strong> 906, Sector 40, Gurugram - 122002, Haryana, India<br />
                                <strong>Response Time:</strong> 15 days
                            </p>
                        </>
                    )
                },
                {
                    id: "12",
                    title: "12. THIRD-PARTY SERVICES AND LINKS",
                    content: (
                        <>
                            <h3>12.1 Third-Party Integrations</h3>
                            <p>Our Website may integrate with or link to third-party services, including:</p>
                            <ul>
                                <li>Payment processors (Razorpay)</li>
                                <li>Analytics services (Google Analytics)</li>
                                <li>Advertising platforms (Google Ads, Facebook, X)</li>
                                <li>Email service providers</li>
                                <li>Social media platforms</li>
                            </ul>
                            <p>We are not responsible for the practices, policies, or content of these third-party services.</p>

                            <h3>12.2 External Links</h3>
                            <p>
                                Our Website may contain links to third-party websites. We do not endorse or assume responsibility for the content,
                                privacy policies, or practices of these websites. You access third-party websites at your own risk.
                            </p>
                        </>
                    )
                },
                {
                    id: "13",
                    title: "13. MODIFICATIONS TO SERVICES AND TERMS",
                    content: (
                        <>
                            <h3>13.1 Changes to Services</h3>
                            <p>We reserve the right to:</p>
                            <ul>
                                <li>Modify, suspend, or discontinue any part of the Services at any time</li>
                                <li>Update or change course content, pricing, or features</li>
                                <li>Add or remove features or functionality</li>
                            </ul>
                            <p>We will make reasonable efforts to notify you of material changes to the Services.</p>

                            <h3>13.2 Changes to Terms</h3>
                            <p>
                                We may update these Terms from time to time. Changes will be effective when posted on the Website with an updated
                                “Last Updated” date. Material changes will be notified via:
                            </p>
                            <ul>
                                <li>Email to registered users (if applicable)</li>
                                <li>Notice on the Website</li>
                                <li>Pop-up notification on the Website</li>
                            </ul>
                            <p>
                                Your continued use of the Services after changes to these Terms constitutes your acceptance of the revised Terms. If
                                you do not agree to the changes, you must stop using the Services.
                            </p>
                        </>
                    )
                },
                {
                    id: "14",
                    title: "14. TERMINATION",
                    content: (
                        <>
                            <h3>14.1 Termination by You</h3>
                            <p>
                                You may stop using our Services at any time. If you wish to cancel your enrollment, please refer to our Refund and
                                Cancellation Policy.
                            </p>

                            <h3>14.2 Termination by Us</h3>
                            <p>We reserve the right to suspend or terminate your access to the Services, with or without notice, for:</p>
                            <ul>
                                <li>Violation of these Terms</li>
                                <li>Fraudulent or illegal activity</li>
                                <li>Non-payment of fees</li>
                                <li>Conduct that harms other users or the Company</li>
                                <li>Any other reason at our sole discretion</li>
                            </ul>

                            <h3>14.3 Effect of Termination</h3>
                            <p>Upon termination:</p>
                            <ul>
                                <li>Your right to access the Services will immediately cease</li>
                                <li>You will not be entitled to any refunds (except as provided in our Refund Policy)</li>
                                <li>Any licenses granted to you under these Terms will immediately terminate</li>
                                <li>Provisions that by their nature should survive termination (including intellectual property rights, disclaimers, limitations of liability, and indemnification) will remain in effect</li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "15",
                    title: "15. DISPUTE RESOLUTION",
                    content: (
                        <>
                            <h3>15.1 Governing Law</h3>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law
                                principles.
                            </p>

                            <h3>15.2 Jurisdiction</h3>
                            <p>
                                Any disputes arising out of or relating to these Terms or the Services shall be subject to the exclusive jurisdiction of the
                                courts in Gurugram, Haryana, India.
                            </p>

                            <h3>15.3 Amicable Resolution</h3>
                            <p>
                                Before initiating any legal proceedings, you agree to first contact us to attempt to resolve the dispute amicably. Please
                                contact our Grievance Officer with details of your dispute.
                            </p>

                            <h3>15.4 Consumer Rights</h3>
                            <p>
                                Nothing in these Terms shall affect your statutory rights under the Consumer Protection Act, 2019, or other applicable
                                consumer protection laws.
                            </p>
                        </>
                    )
                },
                {
                    id: "16",
                    title: "16. FORCE MAJEURE",
                    content: (
                        <>
                            <p>
                                We shall not be liable for any failure or delay in performing our obligations under these Terms due to circumstances
                                beyond our reasonable control, including but not limited to:
                            </p>
                            <ul>
                                <li>Acts of God (earthquakes, floods, fires, storms, etc.)</li>
                                <li>Pandemics or epidemics</li>
                                <li>War, terrorism, riots, or civil disturbances</li>
                                <li>Government actions, laws, or regulations</li>
                                <li>Labor strikes or disputes</li>
                                <li>Internet, telecommunications, or power outages</li>
                                <li>Failures of third-party service providers</li>
                            </ul>
                            <p>In such events, our performance obligations will be suspended for the duration of the force majeure event.</p>
                        </>
                    )
                },
                {
                    id: "17",
                    title: "17. MISCELLANEOUS PROVISIONS",
                    content: (
                        <>
                            <h3>17.1 Entire Agreement</h3>
                            <p>
                                These Terms, together with our Privacy Policy and Refund and Cancellation Policy, constitute the entire agreement
                                between you and the Company regarding the Services and supersede all prior agreements and understandings.
                            </p>

                            <h3>17.2 Severability</h3>
                            <p>
                                If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions will continue
                                in full force and effect.
                            </p>

                            <h3>17.3 Waiver</h3>
                            <p>
                                Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. Any
                                waiver must be in writing and signed by an authorized representative of the Company.
                            </p>

                            <h3>17.4 Assignment</h3>
                            <p>
                                You may not assign or transfer your rights or obligations under these Terms without our prior written consent. We may
                                assign or transfer these Terms, in whole or in part, at any time without restriction.
                            </p>

                            <h3>17.5 No Agency</h3>
                            <p>
                                Nothing in these Terms shall be construed to create a partnership, joint venture, employment, or agency relationship
                                between you and the Company.
                            </p>

                            <h3>17.6 Language</h3>
                            <p>
                                These Terms are drafted in English. In the event of any conflict between the English version and any translation, the
                                English version shall prevail.
                            </p>

                            <h3>17.7 Headings</h3>
                            <p>
                                The headings and section titles in these Terms are for convenience only and have no legal or contractual effect.
                            </p>
                        </>
                    )
                },
                {
                    id: "18",
                    title: "18. CONTACT INFORMATION",
                    content: (
                        <>
                            <p>If you have any questions, concerns, or feedback regarding these Terms or our Services, please contact us:</p>
                            <p>
                                <strong>Company Name:</strong> Athletico Analytic Services LLP<br />
                                <strong>Brand Name:</strong> First Principles Investing<br />
                                <strong>Email:</strong> <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a><br />
                                <strong>Phone:</strong> +91 7011186177<br />
                                <strong>Registered Address:</strong> 906, Sector 40, Gurugram - 122002, Haryana, India
                            </p>
                            <p>
                                <strong>Grievance Officer:</strong> Support Team<br />
                                <strong>Email:</strong> <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a><br />
                                <strong>Phone:</strong> +91 7011186177<br />
                                <strong>Response Time:</strong> We will respond to your inquiry within 15 days
                            </p>
                        </>
                    )
                }
            ]} />

            <div className="mt-16 border-t border-neutral-800 pt-8">
                <h2 className="text-xl md:text-2xl font-semibold tracking-wide text-[#F0EDE8] mb-6">19. ACKNOWLEDGMENT</h2>
                <div className="prose prose-invert max-w-none text-neutral-300">
                    <p className="mb-4">By clicking “I Agree,” accessing the Website, or using our Services, you acknowledge that:</p>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>You have read and understood these Terms of Service in their entirety</li>
                        <li>You agree to be legally bound by these Terms</li>
                        <li>You have read and understood our Privacy Policy and Refund and Cancellation Policy</li>
                        <li>You are at least 18 years of age and legally competent to enter into this agreement</li>
                        <li>You will use the Services in compliance with all applicable laws and regulations</li>
                        <li>You understand that our Services are for educational purposes only and do not constitute financial advice</li>
                    </ol>
                </div>

                <div className="bg-[#1A1A1A] p-6 rounded-lg border border-red-500/20 mt-8">
                    <h3 className="text-xl font-bold mb-4 text-red-500">IMPORTANT NOTICE:</h3>
                    <p className="text-neutral-300 mb-4">
                        These Terms of Service contain important provisions, including disclaimers of warranties, limitations of liability, and an
                        agreement to resolve disputes through the courts in Gurugram, Haryana, India. Please read these Terms carefully
                        before using our Services.
                    </p>
                    <p className="font-bold text-neutral-200">
                        If you do not agree to these Terms, you must not access or use our Website or Services.
                    </p>
                </div>

                <p className="mt-12 font-semibold text-center text-xl text-[#F0EDE8]">Thank you for choosing First Principles Investing for your financial education journey.</p>

                <div className="text-center text-sm text-neutral-500 mt-12 pb-8 border-t border-neutral-800 pt-8 uppercase tracking-widest">
                    END OF TERMS OF SERVICE
                </div>
            </div>
        </LegalPageLayout>
    )
}
