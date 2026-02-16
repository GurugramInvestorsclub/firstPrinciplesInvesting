import { LegalPageLayout } from "@/components/layout/LegalPageLayout"
import { Metadata } from "next"
import { LegalAccordion } from "@/components/ui/legal-accordion"

export const metadata: Metadata = {
    title: "Privacy Policy | First Principles Investing",
    description: "Privacy Policy for First Principles Investing. Learn how we collect, use, and protect your personal information.",
}

export default function PrivacyPolicyPage() {
    return (
        <LegalPageLayout
            title="Privacy Policy"
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
                    Athletico Analytic Services LLP (“we,” “us,” “our,” or “Company”) operates the website www.firstprinciplesinvesting.in
                    under the brand name “First Principles Investing.” We are committed to protecting your privacy and handling your
                    personal information with care and respect.
                </p>
                <p className="text-neutral-300 leading-relaxed mb-4">
                    This Privacy Policy explains how we collect, use, disclose, and protect your personal information in compliance with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-neutral-300 mb-4">
                    <li>Information Technology Act, 2000</li>
                    <li>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</li>
                    <li>Digital Personal Data Protection Act, 2023</li>
                    <li>Consumer Protection Act, 2019</li>
                    <li>Google Ads and Analytics requirements</li>
                </ul>
                <p className="text-neutral-300 leading-relaxed">
                    By accessing or using our website, you consent to the collection and use of your information as described in this Privacy Policy.
                </p>
            </div>

            <LegalAccordion items={[
                {
                    id: "2",
                    title: "2. INFORMATION WE COLLECT",
                    content: (
                        <>
                            <h3>2.1 Personal Information You Provide</h3>
                            <p>We may collect the following personal information directly from you:</p>
                            <ul>
                                <li><strong>Contact Information:</strong> Name, email address, phone number</li>
                                <li><strong>Additional Information:</strong> We may collect other information as we develop our services, which may include demographic information, financial goals, educational preferences, and other details you voluntarily provide</li>
                            </ul>

                            <h3>2.2 Information Collected Automatically</h3>
                            <p>When you visit our website, we automatically collect certain information:</p>
                            <ul>
                                <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
                                <li><strong>Usage Information:</strong> Pages visited, time spent on pages, links clicked, referring website</li>
                                <li><strong>Location Information:</strong> General geographic location based on IP address</li>
                                <li><strong>Cookies and Tracking Technologies:</strong> We use cookies, web beacons, and similar technologies to collect information about your browsing behavior</li>
                            </ul>

                            <h3>2.3 Information from Third Parties</h3>
                            <p>We may receive information about you from third-party services we use, including:</p>
                            <ul>
                                <li>Payment processors (Razorpay)</li>
                                <li>Email service providers</li>
                                <li>Customer Relationship Management (CRM) tools</li>
                                <li>Analytics services (Google Analytics)</li>
                                <li>Advertising platforms (Google Ads, Facebook, X/Twitter)</li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "3",
                    title: "3. HOW WE USE YOUR INFORMATION",
                    content: (
                        <>
                            <p>We use the collected information for the following purposes:</p>

                            <h3>3.1 Service Delivery</h3>
                            <ul>
                                <li>Processing course registrations and workshop bookings</li>
                                <li>Providing access to educational content and programs</li>
                                <li>Communicating about your enrollments and course progress</li>
                                <li>Customer support and responding to inquiries</li>
                            </ul>

                            <h3>3.2 Marketing and Communication</h3>
                            <ul>
                                <li>Sending promotional emails, SMS, and WhatsApp messages about our courses, workshops, and services</li>
                                <li>Sharing educational content, newsletters, and updates</li>
                                <li>Conducting surveys and gathering feedback</li>
                            </ul>

                            <h3>3.3 Website Improvement</h3>
                            <ul>
                                <li>Analyzing website usage and user behavior</li>
                                <li>Improving website functionality and user experience</li>
                                <li>Testing new features and services</li>
                            </ul>

                            <h3>3.4 Advertising and Remarketing</h3>
                            <ul>
                                <li>Displaying targeted advertisements on third-party platforms</li>
                                <li>Retargeting users who have visited our website</li>
                                <li>Measuring advertising campaign effectiveness</li>
                                <li>Creating custom and lookalike audiences</li>
                            </ul>

                            <h3>3.5 Legal and Security</h3>
                            <ul>
                                <li>Complying with legal obligations and regulatory requirements</li>
                                <li>Protecting against fraud, abuse, and security threats</li>
                                <li>Enforcing our Terms of Service</li>
                                <li>Resolving disputes</li>
                            </ul>
                        </>
                    )
                },
                {
                    id: "4",
                    title: "4. COOKIES AND TRACKING TECHNOLOGIES",
                    content: (
                        <>
                            <h3>4.1 What Are Cookies?</h3>
                            <p>
                                Cookies are small text files stored on your device when you visit our website. We use both session cookies (which
                                expire when you close your browser) and persistent cookies (which remain on your device).
                            </p>

                            <h3>4.2 Types of Cookies We Use</h3>
                            <ul>
                                <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website (Google Analytics)</li>
                                <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements and track campaign performance</li>
                                <li><strong>Remarketing Cookies:</strong> Allow us to show ads to users who previously visited our website</li>
                            </ul>

                            <h3>4.3 Google Analytics and Advertising</h3>
                            <p>
                                We use Google Analytics to understand website traffic and user behavior. Google Analytics uses cookies to collect
                                information about:
                            </p>
                            <ul>
                                <li>How you found our website</li>
                                <li>Pages you visited</li>
                                <li>Time spent on our website</li>
                                <li>Your interactions with our content</li>
                            </ul>
                            <p>
                                <strong>Google Advertising Features:</strong> We have enabled the following Google Analytics Advertising Features:
                            </p>
                            <ul>
                                <li>Remarketing with Google Analytics</li>
                                <li>Google Display Network Impression Reporting</li>
                                <li>Demographics and Interest Reporting</li>
                            </ul>
                            <p>
                                <strong>Third-Party Advertising:</strong> Third-party vendors, including Google, use cookies to serve ads based on your prior visits to
                                our website or other websites on the Internet. Google’s use of advertising cookies enables it and its partners to serve
                                ads to you based on your visit to our sites and/or other sites on the Internet.
                            </p>

                            <h3>4.4 Managing Cookies</h3>
                            <p>You can control and manage cookies through your browser settings:</p>
                            <p><strong>Opt-out of Google Advertising:</strong></p>
                            <ul>
                                <li>Visit Google Ads Settings: <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">https://www.google.com/settings/ads</a></li>
                                <li>Opt out of Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">https://tools.google.com/dlpage/gaoptout</a></li>
                                <li>Visit the Network Advertising Initiative opt-out page: <a href="http://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer">http://www.networkadvertising.org/choices/</a></li>
                            </ul>
                            <p>
                                <strong>Browser Settings:</strong> Most browsers allow you to refuse cookies or delete cookies. However, blocking cookies may affect
                                website functionality.
                            </p>

                            <h3>4.5 Facebook Pixel and X Pixel</h3>
                            <p>
                                We use Facebook Pixel and X (formerly Twitter) Pixel to track conversions, optimize ads, and build audiences for
                                advertising campaigns. These pixels collect information about your visit to our website and may be used to show you
                                targeted ads on Facebook, Instagram, and X platforms.
                            </p>
                        </>
                    )
                },
                {
                    id: "5",
                    title: "5. HOW WE SHARE YOUR INFORMATION",
                    content: (
                        <>
                            <p>
                                We do not sell your personal information to third parties. However, we share your information with the following
                                categories of service providers:
                            </p>

                            <h3>5.1 Service Providers</h3>
                            <p>We share information with third-party service providers who perform services on our behalf:</p>
                            <ul>
                                <li><strong>Payment Processors:</strong> Razorpay (for processing payments)</li>
                                <li><strong>Email Service Providers:</strong> For sending marketing emails and newsletters</li>
                                <li><strong>CRM Platforms:</strong> For managing customer relationships and communications</li>
                                <li><strong>Analytics Services:</strong> Google Analytics and other analytics tools</li>
                                <li><strong>Advertising Platforms:</strong> Google Ads, Facebook Ads, X Ads</li>
                                <li><strong>SMS/WhatsApp Service Providers:</strong> For sending text messages and WhatsApp messages</li>
                            </ul>
                            <p>
                                These service providers are contractually obligated to use your information only to provide services to us and to
                                protect your information.
                            </p>

                            <h3>5.2 Legal Requirements</h3>
                            <p>We may disclose your information if required by law, regulation, legal process, or governmental request, or to:</p>
                            <ul>
                                <li>Enforce our Terms of Service</li>
                                <li>Protect our rights, property, or safety</li>
                                <li>Protect the rights, property, or safety of our users or the public</li>
                            </ul>

                            <h3>5.3 Business Transfers</h3>
                            <p>
                                In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred to the
                                acquiring entity.
                            </p>
                        </>
                    )
                },
                {
                    id: "6",
                    title: "6. DATA SECURITY",
                    content: (
                        <>
                            <p>
                                We implement reasonable security measures to protect your personal information from unauthorized access,
                                disclosure, alteration, and destruction. These measures include:
                            </p>
                            <ul>
                                <li>Secure Socket Layer (SSL) encryption for data transmission</li>
                                <li>Restricted access to personal information</li>
                                <li>Regular security assessments</li>
                                <li>Secure payment processing through PCI-DSS compliant payment gateways</li>
                            </ul>
                            <p>
                                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect
                                your information, we cannot guarantee absolute security.
                            </p>
                        </>
                    )
                },
                {
                    id: "7",
                    title: "7. DATA RETENTION",
                    content: (
                        <>
                            <p>We retain your personal information for as long as necessary to:</p>
                            <ul>
                                <li>Provide our services to you</li>
                                <li>Comply with legal obligations</li>
                                <li>Resolve disputes</li>
                                <li>Enforce our agreements</li>
                            </ul>
                            <p>When personal information is no longer needed, we will securely delete or anonymize it.</p>
                        </>
                    )
                },
                {
                    id: "8",
                    title: "8. YOUR RIGHTS",
                    content: (
                        <>
                            <p>Under applicable Indian data protection laws, you have the following rights:</p>

                            <h3>8.1 Access and Correction</h3>
                            <p>You have the right to access your personal information and request corrections if it is inaccurate or incomplete.</p>

                            <h3>8.2 Withdrawal of Consent</h3>
                            <p>You may withdraw your consent for marketing communications at any time by:</p>
                            <ul>
                                <li>Clicking the “unsubscribe” link in our emails</li>
                                <li>Contacting us at <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a></li>
                                <li>Replying “STOP” to SMS messages</li>
                            </ul>

                            <h3>8.3 Deletion</h3>
                            <p>You may request deletion of your personal information, subject to legal and contractual obligations.</p>

                            <h3>8.4 Data Portability</h3>
                            <p>You may request a copy of your personal information in a structured, commonly used format.</p>
                            <p>To exercise any of these rights, please contact our Grievance Officer (details below).</p>
                        </>
                    )
                },
                {
                    id: "9",
                    title: "9. CHILDREN’S PRIVACY",
                    content: (
                        <>
                            <p>
                                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information
                                from children. If you are a parent or guardian and believe your child has provided us with personal information, please
                                contact us immediately.
                            </p>
                        </>
                    )
                },
                {
                    id: "10",
                    title: "10. INTERNATIONAL DATA TRANSFERS",
                    content: (
                        <>
                            <p>
                                Your information may be transferred to and processed in locations outside India. We ensure that appropriate
                                safeguards are in place to protect your information in accordance with this Privacy Policy and applicable laws.
                            </p>
                        </>
                    )
                },
                {
                    id: "11",
                    title: "11. THIRD-PARTY LINKS",
                    content: (
                        <>
                            <p>
                                Our website may contain links to third-party websites. We are not responsible for the privacy practices of these
                                websites. We encourage you to review the privacy policies of any third-party sites you visit.
                            </p>
                        </>
                    )
                },
                {
                    id: "12",
                    title: "12. CHANGES TO THIS PRIVACY POLICY",
                    content: (
                        <>
                            <p>
                                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will
                                notify you of material changes by:
                            </p>
                            <ul>
                                <li>Posting the updated policy on our website</li>
                                <li>Updating the “Last Updated” date at the top of this policy</li>
                            </ul>
                            <p>Your continued use of our services after such changes constitutes acceptance of the updated Privacy Policy.</p>
                        </>
                    )
                },
                {
                    id: "13",
                    title: "13. GRIEVANCE OFFICER",
                    content: (
                        <>
                            <p>
                                In accordance with the Information Technology Act, 2000, and the Digital Personal Data Protection Act, 2023, we have
                                appointed a Grievance Officer to address your privacy concerns:
                            </p>
                            <p>
                                <strong>Grievance Officer:</strong> Support Team<br />
                                <strong>Email:</strong> <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a><br />
                                <strong>Phone:</strong> +91 7011186177<br />
                                <strong>Address:</strong> 906, Sector 40, Gurugram - 122002, Haryana, India<br />
                                <strong>Response Time:</strong> We will acknowledge your complaint within 48 hours and resolve it within 15 days.
                            </p>
                            <p>
                                If you have any concerns regarding the processing of your personal information, please contact our Grievance Officer.
                                We will investigate and respond to your complaint in accordance with applicable laws.
                            </p>
                        </>
                    )
                },
                {
                    id: "14",
                    title: "14. CONTACT US",
                    content: (
                        <>
                            <p>If you have any questions about this Privacy Policy or our privacy practices, please contact us:</p>
                            <p>
                                <strong>Email:</strong> <a href="mailto:support@firstprinciplesresearch.in">support@firstprinciplesresearch.in</a><br />
                                <strong>Phone:</strong> +91 7011186177<br />
                                <strong>Address:</strong> Athletico Analytic Services LLP, 906, Sector 40, Gurugram - 122002, Haryana, India
                            </p>
                        </>
                    )
                }
            ]} />

            <div className="mt-16 border-t border-neutral-800 pt-8">
                <h3>Acknowledgment</h3>
                <p>
                    By using our website and services, you acknowledge that you have read and understood this Privacy Policy and agree to
                    its terms.
                </p>
            </div>
        </LegalPageLayout>
    )
}
