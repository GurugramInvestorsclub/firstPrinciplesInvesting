import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'super30Program',
    title: 'Super 30 Program',
    type: 'document',
    fields: [
        // 1. Basic Info
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'batchName',
            title: 'Batch Name',
            description: 'Example: Batch 3',
            type: 'string',
        }),
        defineField({
            name: 'tagline',
            title: 'Tagline',
            description: 'Example: 30 days. 30 frameworks. 1 transformed investor.',
            type: 'string',
        }),
        defineField({
            name: 'shortDescription',
            title: 'Short Description',
            description: 'A brief description of the program.',
            type: 'text',
            rows: 3,
        }),

        // 2. Hero Section
        defineField({
            name: 'headline',
            title: 'Hero Headline',
            type: 'string',
        }),
        defineField({
            name: 'subheadline',
            title: 'Hero Subheadline',
            type: 'text',
            rows: 2,
        }),
        defineField({
            name: 'ctaText',
            title: 'CTA Text',
            description: 'Default is "Apply Now" or "Enroll Now"',
            type: 'string',
        }),
        defineField({
            name: 'seatsAvailable',
            title: 'Seats Available',
            type: 'number',
        }),
        defineField({
            name: 'applicationDeadline',
            title: 'Application Deadline',
            type: 'datetime',
        }),

        // 3. Problem Section
        defineField({
            name: 'painPoints',
            title: 'Pain Points',
            description: 'List of problems the average investor faces.',
            type: 'array',
            of: [{ type: 'string' }],
        }),

        // 4. Philosophy Section
        defineField({
            name: 'philosophyHeading',
            title: 'Philosophy Heading',
            type: 'string',
        }),
        defineField({
            name: 'philosophyDescription',
            title: 'Philosophy Description',
            type: 'array',
            of: [{ type: 'block' }],
        }),

        // 5. Deliverables (What You Get)
        defineField({
            name: 'deliverables',
            title: 'Deliverables (What You Get)',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    { name: 'title', title: 'Title', type: 'string' },
                    { name: 'description', title: 'Description', type: 'text', rows: 2 },
                ]
            }],
        }),

        // 6. Outcomes
        defineField({
            name: 'outcomes',
            title: 'Outcomes',
            description: 'Transformation statements (e.g., Before -> After)',
            type: 'array',
            of: [{ type: 'string' }],
        }),

        // 7. Who It's For
        defineField({
            name: 'whoItsFor',
            title: 'Who It Is For',
            type: 'array',
            of: [{ type: 'string' }],
        }),

        // 8. Who It's Not For
        defineField({
            name: 'whoItsNotFor',
            title: 'Who It Is NOT For',
            type: 'array',
            of: [{ type: 'string' }],
        }),

        // 9. Pricing
        defineField({
            name: 'price',
            title: 'Display Price (INR)',
            description: 'Display-only CMS price. Billing amount is calculated from backend event pricing.',
            type: 'number',
        }),
        defineField({
            name: 'currency',
            title: 'Currency',
            type: 'string',
            initialValue: 'INR',
        }),
        defineField({
            name: 'eventId',
            title: 'Event ID',
            description: 'Stable backend identifier used for payment mapping (e.g., SUPER30_BATCH3). MUST MATCH DB.',
            type: 'string',
            validation: (Rule) =>
                Rule.required()
                    .min(3)
                    .max(64)
                    .regex(/^[A-Za-z0-9_-]+$/, {
                        name: 'letters, numbers, underscore or hyphen',
                    })
        }),

        // 10. Social Proof
        defineField({
            name: 'testimonials',
            title: 'Testimonials',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    { name: 'name', title: 'Name', type: 'string' },
                    { name: 'text', title: 'Quote/Text', type: 'text', rows: 3 },
                    { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
                ]
            }],
        }),

        // 11. FAQ
        defineField({
            name: 'faq',
            title: 'FAQ',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    { name: 'question', title: 'Question', type: 'string' },
                    { name: 'answer', title: 'Answer', type: 'text' },
                ]
            }],
        }),

        // 12. Status Controls
        defineField({
            name: 'isActive',
            title: 'Is Active?',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'isSoldOut',
            title: 'Is Sold Out?',
            type: 'boolean',
            initialValue: false,
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'batchName',
        },
    },
})
