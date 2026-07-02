import { Metadata } from "next"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { HeroSection } from "@/components/membership/HeroSection"
import { ProblemSection } from "@/components/membership/ProblemSection"
import { SolutionSection } from "@/components/membership/SolutionSection"
import { InsideReportSection } from "@/components/membership/InsideReportSection"
import { BenefitsSection } from "@/components/membership/BenefitsSection"
import { FeaturedResearchSection } from "@/components/membership/FeaturedResearchSection"
import { RoadmapSection } from "@/components/membership/RoadmapSection"
import { MethodologySection } from "@/components/membership/MethodologySection"
import { ComparisonSection } from "@/components/membership/ComparisonSection"
import { AudienceSection } from "@/components/membership/AudienceSection"
import { TestimonialWrap } from "@/components/membership/TestimonialWrap"
import { PricingSection } from "@/components/membership/PricingSection"
import { FAQSection } from "@/components/membership/FAQSection"
import { FinalCTASection } from "@/components/membership/FinalCTASection"
import { StickyInterface } from "@/components/membership/StickyInterface"
import { client } from "@/lib/sanity.client"
import { testimonialsQuery } from "@/lib/sanity.queries"
import { Testimonial } from "@/lib/types"

export const revalidate = 60 // Revalidate cache every minute

export const metadata: Metadata = {
    title: "Membership | First Principles Investing",
    description: "Join First Principles Investing. Build high conviction through institutional-quality research models, deep-dive mappings, and active manager scuttlebutt.",
    keywords: ["First Principles Investing Membership", "Investment Research India", "SaaS Deep Dives", "Moat Analysis", "Long-term Investing"],
    openGraph: {
        title: "Membership | First Principles Investing",
        description: "Join First Principles Investing. Get institutional-quality research that compounds.",
        type: "website",
        url: "https://firstprinciplesinvesting.com/membership",
    }
}

export default async function MembershipPage() {
    // Fetch testimonials from Sanity
    const testimonials = await client.fetch<Testimonial[]>(testimonialsQuery, {}, { next: { revalidate: 60 } })

    return (
        <div className="flex flex-col min-h-screen bg-bg-deep text-text-primary antialiased">
            <Navbar />
            
            {/* Sticky Scroll Progress and Floating Widgets */}
            <StickyInterface />

            <main className="flex-1">
                {/* 1. Hero */}
                <HeroSection />

                {/* 2. The Problem */}
                <ProblemSection />

                {/* 3. The Solution */}
                <SolutionSection />

                {/* 4. Inside a Research Report (Mockup Scroll) */}
                <InsideReportSection />

                {/* 5. What Members Receive */}
                <BenefitsSection />

                {/* 6. Featured Research Bento */}
                <FeaturedResearchSection />

                {/* 7. Upcoming Research Roadmap */}
                <RoadmapSection />

                {/* 8. Research Methodology Funnel */}
                <MethodologySection />

                {/* 9. Free vs Member Table */}
                <ComparisonSection />

                {/* 10. Who This Is For & Not For */}
                <AudienceSection />

                {/* 11. Testimonials */}
                <TestimonialWrap testimonials={testimonials} />

                {/* 12. Pricing Card */}
                <PricingSection />

                {/* 13. FAQ Accordion */}
                <FAQSection />

                {/* 14. Final Emotion-driven CTA */}
                <FinalCTASection />
            </main>

            <Footer />
        </div>
    )
}
