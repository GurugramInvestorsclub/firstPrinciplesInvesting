import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'post',
    title: 'Post',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),
        defineField({
            name: 'isFeatured',
            title: 'Featured Insight',
            type: 'boolean',
            initialValue: false,
            description: 'Mark this insight as featured. Only one insight should be featured at a time.',
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
        }),
        defineField({
            name: 'excerpt',
            title: 'Excerpt',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'access',
            title: 'Access',
            type: 'string',
            initialValue: 'public',
            options: {
                list: [
                    { title: 'Public', value: 'public' },
                    { title: 'Subscriber Only', value: 'subscriber' },
                ],
                layout: 'radio',
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'mainImage',
            title: 'Main image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published at',
            type: 'datetime',
        }),
        defineField({
            name: 'disclaimer',
            title: 'Disclaimer',
            type: 'array',
            description: 'Optional custom disclaimer shown below the date. If left empty, the standard default SEBI educational disclaimer is shown.',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'body',
            title: 'Body',
            type: 'array',
            of: [{ type: 'block' }, { type: 'image' }],
        }),
        defineField({
            name: 'previewBody',
            title: 'Preview Body',
            type: 'array',
            description: 'Optional teaser shown before the paywall for subscriber-only insights. If left empty, the frontend falls back to the opening portion of the body.',
            of: [{ type: 'block' }, { type: 'image' }],
            hidden: ({ parent }) => parent?.access !== 'subscriber',
        }),
        defineField({
            name: 'paywallHeadline',
            title: 'Paywall Headline',
            type: 'string',
            description: 'Optional override for the subscriber CTA headline.',
            hidden: ({ parent }) => parent?.access !== 'subscriber',
        }),
        defineField({
            name: 'paywallCtaText',
            title: 'Paywall CTA Text',
            type: 'string',
            description: 'Optional override for the subscriber CTA button copy.',
            hidden: ({ parent }) => parent?.access !== 'subscriber',
        }),
    ],
})
