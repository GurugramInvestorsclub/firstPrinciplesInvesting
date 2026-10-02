import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Mail, MapPin } from "lucide-react"
import { ContactForm } from "@/components/contact/ContactForm"

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
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
