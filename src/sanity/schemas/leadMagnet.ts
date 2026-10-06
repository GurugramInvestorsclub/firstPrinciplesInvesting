import { defineField, defineType, defineArrayMember } from 'sanity'

export default defineType({
    name: 'leadMagnet',
    title: 'Lead Magnet',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Report Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
            description: 'The primary title of this lead magnet report (e.g., "The Complete Indian Railway Capex Playbook").',
        }),
        defineField({
            name: 'slug',
            title: 'Slug (URL Path)',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
            description: 'Accessible at /resources/[slug] (e.g., /resources/railway-capex-playbook).',
        }),
        defineField({
            name: 'badge',
            title: 'Eyebrow Badge Text',
            type: 'string',
            initialValue: 'Free Special Research Report',
            description: 'Small tag pill shown above the title (e.g., "Free Institutional Memo", "Complimentary Case Study").',
        }),
        defineField({
            name: 'heroHeadline',
            title: 'Landing Page Hero Headline',
            type: 'string',
            description: 'Punchy headline for the lead capture hero. If left empty, Report Title will be used.',
        }),
        defineField({
            name: 'heroSubtitle',
            title: 'Landing Page Subtitle / Hook',
            type: 'text',
            rows: 3,
            description: 'Compelling 2-3 sentence overview highlighting what investors will uncover in this free report.',
        }),
        defineField({
            name: 'keyTakeaways',
            title: 'Key Takeaways / Highlights',
            type: 'array',
            of: [defineArrayMember({ type: 'string' })],
            description: 'Bullet points shown on the landing page highlighting specific insights or data points inside the report.',
        }),
        defineField({
            name: 'mainImage',
            title: 'Cover Image / Report Mockup',
            type: 'image',
            options: {
                hotspot: true,
            },
            description: 'Hero cover image or document graphic representing this research report.',
        }),
        defineField({
            name: 'pdfFile',
            title: 'Report PDF File',
            type: 'file',
            options: {
                accept: 'application/pdf',
            },
            validation: (Rule) => Rule.required(),
            description: 'Upload the PDF report here. This document will be delivered to the user via Brevo email upon form submission.',
        }),
        defineField({
            name: 'formCtaText',
            title: 'Form CTA Button Text',
            type: 'string',
            initialValue: 'Get Free PDF Report',
            description: 'Text displayed on the form submission button.',
        }),
        defineField({
            name: 'emailSubject',
            title: 'Custom Email Subject (Optional)',
            type: 'string',
            description: 'Subject line of the email sent to the user. Default: "Your Free Report: [Title]"',
        }),
        defineField({
            name: 'emailPreviewText',
            title: 'Email Intro Note (Optional)',
            type: 'text',
            rows: 3,
            description: 'A personal introductory message included in the email from the research team.',
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published Date',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
        }),
        defineField({
            name: 'sampleInsights',
            title: 'Curated Sample Insights for Thank-You Page (Optional)',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'reference',
                    to: [{ type: 'post' }],
                }),
            ],
            description: 'Select up to 3 past posts to showcase on the Thank-You page. If empty, the 3 most recent approved posts will be displayed automatically.',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            slug: 'slug.current',
            media: 'mainImage',
        },
        prepare({ title, slug, media }) {
            return {
                title: title || 'Untitled Lead Magnet',
                subtitle: slug ? `/resources/${slug}` : 'No slug set',
                media,
            }
        },
    },
})
