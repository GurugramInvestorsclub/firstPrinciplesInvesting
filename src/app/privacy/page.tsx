import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export const metadata = {
    title: "Privacy Policy - First Principles Investing",
    description: "Our commitment to protecting your privacy.",
}

export default function PrivacyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-bg-deep text-text-primary selection:bg-gold/20 selection:text-gold">
            <Navbar />

            <main className="flex-1 py-16 md:py-24 pt-40">
                <div className="container max-w-4xl px-4 md:px-8 mx-auto">
                    <div className="mb-12 border-b border-[#2E2E2E] pb-8">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-text-primary">Privacy Policy</h1>
                        <p className="text-text-secondary">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>

                    <div className="prose prose-invert max-w-none text-text-secondary">
                        <p className="text-lg leading-relaxed mb-8">
                            At First Principles Investing, we value your privacy and are committed to protecting your personal information.
                            This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services.
                        </p>

                        <h2 className="text-2xl font-semibold mt-12 mb-4 text-text-primary">1. Information We Collect</h2>
                        <ul className="list-disc pl-6 space-y-2 mb-6 marker:text-gold">
                            <li><strong className="text-text-primary">Personal Information:</strong> Name, email address, and phone number when you register for events or contact us.</li>
                            <li><strong className="text-text-primary">Usage Data:</strong> Information about how you use our website, including IP address, browser type, and pages visited.</li>
                        </ul>

                        <h2 className="text-2xl font-semibold mt-12 mb-4 text-text-primary">2. How We Use Your Information</h2>
                        <p className="mb-4">We use the collected information to:</p>
                        <ul className="list-disc pl-6 space-y-2 mb-6 marker:text-gold">
                            <li>Process event registrations and communicate with you about updates.</li>
                            <li>Respond to your inquiries and provide customer support.</li>
                            <li>Improve our website and services based on user behavior.</li>
                            <li>Send newsletters or promotional materials (only if you have opted in).</li>
                        </ul>

                        <h2 className="text-2xl font-semibold mt-12 mb-4 text-text-primary">3. Data Security</h2>
                        <p className="mb-6">
                            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
                            However, please note that no method of transmission over the internet is 100% secure.
                        </p>

                        <h2 className="text-2xl font-semibold mt-12 mb-4 text-text-primary">4. Third-Party Services</h2>
                        <p className="mb-6">
                            We may use third-party services (such as analytics providers or payment processors) that collect, monitor, and analyze this type of information.
                            These third parties have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                        </p>

                        <h2 className="text-2xl font-semibold mt-12 mb-4 text-text-primary">5. Contact Us</h2>
                        <p className="mb-6">
                            If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:hello@firstprinciples.in" className="text-gold hover:underline">hello@firstprinciples.in</a>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
