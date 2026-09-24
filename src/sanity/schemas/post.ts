import { defineField, defineType, defineArrayMember } from 'sanity'

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
            name: 'approvalStatus',
            title: 'Approval Status (Live Website Visibility)',
            type: 'string',
            initialValue: 'pending',
            options: {
                list: [
                    { title: '🟡 Pending Admin Approval (Preview Only - Hidden from Public)', value: 'pending' },
                    { title: '🟢 Approved & Live (Visible on Website)', value: 'approved' },
                ],
                layout: 'radio',
            },
            description: 'When "Pending", only authenticated admins can preview this post at /insights/[slug]. Once "Approved", it is published live to everyone according to its Access tier.',
        }),
        defineField({
            name: 'approvedAt',
            title: 'Approved at',
            type: 'datetime',
            readOnly: true,
            description: 'Automatically recorded timestamp when the post was approved.',
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
            description: 'Short summary shown on cards and carousels (not displayed inside the article)',
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
            name: 'updates',
            title: 'Article Updates & Linked Coverage',
            type: 'array',
            description: 'Add one or more linked updates or related articles. Displayed as a dedicated update block right after the disclaimer.',
            of: [
                defineArrayMember({
                    type: 'object',
                    title: 'Linked Article / Update',
                    fields: [
                        defineField({
                            name: 'post',
                            title: 'Select Existing Post (Optional)',
                            type: 'reference',
                            to: [{ type: 'post' }],
                            description: 'Select an existing post from your CMS. If selected, its title and link will be automatically used by default.',
                        }),
                        defineField({
                            name: 'title',
                            title: 'Title / Custom Label',
                            type: 'string',
                            description: 'Title for this update link (optional if an existing post is selected above, or use this to override its title).',
                        }),
                        defineField({
                            name: 'url',
                            title: 'Custom Link / URL',
                            type: 'string',
                            description: 'Direct link or path (e.g. /insights/gocl-deep-dive or full URL). Required if no existing post is selected.',
                        }),
                        defineField({
                            name: 'description',
                            title: 'Context / Note (Optional)',
                            type: 'text',
                            rows: 2,
                            description: 'Optional note shown with the link (e.g. "GOCL - HNPCL merger/special situation Deep-dive was released on 18th June 2026. This is an update.")',
                        }),
                        defineField({
                            name: 'date',
                            title: 'Date / Period (Optional)',
                            type: 'string',
                            description: 'e.g. "18th June 2026" or "June 2026"',
                        }),
                        defineField({
                            name: 'badge',
                            title: 'Badge Label (Optional)',
                            type: 'string',
                            initialValue: 'Update',
                            description: 'Label shown on the badge pill (e.g. "Update", "Original Thesis", "Previous Coverage", "Part 1")',
                        }),
                    ],
                    preview: {
                        select: {
                            title: 'title',
                            refTitle: 'post.title',
                            url: 'url',
                            refSlug: 'post.slug.current',
                            badge: 'badge',
                        },
                        prepare({ title, refTitle, url, refSlug, badge }) {
                            const displayTitle = title || refTitle || 'Untitled Update'
                            const displayLink = url || (refSlug ? `/insights/${refSlug}` : 'No link specified')
                            return {
                                title: displayTitle,
                                subtitle: `[${badge || 'Update'}] → ${displayLink}`,
                            }
                        },
                    },
                }),
            ],
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
