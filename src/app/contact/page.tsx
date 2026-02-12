import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Mail, MapPin } from "lucide-react"

export const metadata = {
    title: "Contact Us - First Principles Investing",
    description: "Get in touch with us for inquiries, support, or collaborations.",
}

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen bg-bg-deep text-text-primary selection:bg-gold/20 selection:text-gold">
            <Navbar />

            <main className="flex-1 py-16 md:py-24 pt-40">
                <div className="container max-w-4xl px-4 md:px-8 mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-text-primary">Contact Us</h1>
                        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                            Have questions or want to collaborate? We'd love to hear from you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        {/* Contact Info */}
                        <div className="bg-[#1F1F1F] p-8 rounded-2xl border border-[#2E2E2E]">
                            <h2 className="text-2xl font-semibold mb-6 text-gold">Get in Touch</h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-1 text-text-primary">Email</h3>
                                        <a href="mailto:Support@firstprinciplesresearch.in" className="text-text-secondary hover:text-gold transition-colors break-all">
                                            Support@firstprinciplesresearch.in
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-1 text-text-primary">Location</h3>
                                        <p className="text-text-secondary">
                                            Gurugram, India
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-[#2E2E2E]">
                                <p className="text-sm text-text-secondary">
                                    Operating Hours: Monday - Friday, 9am - 6pm IST
                                </p>
                            </div>
                        </div>

                        {/* Functional Form */}
                        <div className="bg-bg-deep border border-[#2E2E2E] rounded-2xl p-8 shadow-sm">
                            <h2 className="text-2xl font-semibold mb-6 text-text-primary">Send a Message</h2>
                            <form action="https://formsubmit.co/Support@firstprinciplesresearch.in" method="POST" className="space-y-4">
                                {/* Honeypot to prevent spam */}
                                <input type="text" name="_honey" style={{ display: 'none' }} />

                                {/* Redirect after submission (optional, can stay on page or go to thank you) */}
                                <input type="hidden" name="_next" value="https://firstprinciplesinvesting.com/thank-you" />

                                {/* Subject line */}
                                <input type="hidden" name="_subject" value="New Contact Form Submission - First Principles Investing" />

                                <div className="grid gap-2">
                                    <label htmlFor="name" className="text-sm font-medium text-text-secondary">Name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="flex h-10 w-full rounded-md border border-[#2E2E2E] bg-[#1F1F1F] px-3 py-2 text-sm text-text-primary ring-offset-bg-deep placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="email" className="text-sm font-medium text-text-secondary">Email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="flex h-10 w-full rounded-md border border-[#2E2E2E] bg-[#1F1F1F] px-3 py-2 text-sm text-text-primary ring-offset-bg-deep placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="message" className="text-sm font-medium text-text-secondary">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        className="flex min-h-[120px] w-full rounded-md border border-[#2E2E2E] bg-[#1F1F1F] px-3 py-2 text-sm text-text-primary ring-offset-bg-deep placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-bg-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gold text-bg-deep hover:bg-gold-muted h-10 px-4 py-2 w-full font-semibold"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
