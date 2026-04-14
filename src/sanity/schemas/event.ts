import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'event',
    title: 'Event',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),
        defineField({
            name: 'subHeading',
            title: 'Sub Heading',
            description: 'Short persuasive sentence under hero headline.',
            type: 'text',
            rows: 2,
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
            name: 'date',
            title: 'Date and Time',
            type: 'datetime',
        }),
        defineField({
            name: 'eventId',
            title: 'Event ID',
            description: 'Stable backend identifier used for payment mapping (e.g. APR2026_MASTERCLASS).',
            type: 'string',
            validation: (Rule) =>
                Rule.required()
                    .min(3)
                    .max(64)
                    .regex(/^[A-Za-z0-9_-]+$/, {
                        name: 'letters, numbers, underscore or hyphen',
                    })
                    .custom(async (value, context) => {
                        if (!value) return true

                        const client = context.getClient({ apiVersion: '2024-03-19' })

                        const documentId = context.document?._id?.replace(/^drafts\./, '')
                        if (!documentId) return true

                        const duplicate = await client.fetch(
                            `*[_type == "event" && eventId == $eventId && !(_id in [$draftId, $publishedId])][0]._id`,
                            {
                                eventId: value,
                                draftId: `drafts.${documentId}`,
                                publishedId: documentId,
                            }
                        )

                        return !duplicate || 'eventId must be unique across events'
                    }),
        }),
        defineField({
            name: 'price',
            title: 'Display Price (INR)',
            description:
                'Display-only CMS price. Billing amount is calculated from backend event pricing, not from this field.',
            type: 'number',
            validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
            name: 'location',
            title: 'Location',
            type: 'string',
        }),
        defineField({
            name: 'highlightStat',
            title: 'Highlight Statistic',
            description: 'Example: "~87% of stocks are not listed in India."',
            type: 'string',
        }),
        defineField({
            name: 'shortDescription',
            title: 'Short Description',
            type: 'text',
            rows: 2,
        }),
        defineField({
            name: 'whyThisMatters',
            title: 'Why This Matters',
            description: 'Narrative explanation section.',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'learningPoints',
            title: 'What You Will Learn',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    { name: 'title', type: 'string', title: 'Title' },
                    { name: 'description', type: 'text', title: 'Description', rows: 3 },
                ]
            }],
        }),
        defineField({
            name: 'targetAudience',
            title: 'Who Should Attend',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    { name: 'title', type: 'string', title: 'Title' },
                    { name: 'description', type: 'text', title: 'Description', rows: 3 },
                ]
            }],
        }),
        defineField({
            name: 'speaker',
            title: 'Speaker',
            type: 'object',
            fields: [
                { name: 'name', type: 'string', title: 'Name' },
                { name: 'image', type: 'image', title: 'Image', options: { hotspot: true } },
                { name: 'bio', type: 'text', title: 'Bio' },
                { name: 'credentials', type: 'array', title: 'Credentials', of: [{ type: 'string' }] },
            ]
        }),
        defineField({
            name: 'agenda',
            title: 'Agenda',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    { name: 'time', type: 'string', title: 'Time' },
                    { name: 'title', type: 'string', title: 'Title' },
                    { name: 'description', type: 'text', title: 'Description' },
                ]
            }],
        }),
        defineField({
            name: 'faq',
            title: 'FAQ',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    { name: 'question', type: 'string', title: 'Question' },
                    { name: 'answer', type: 'text', title: 'Answer' },
                ]
            }],
        }),
        defineField({
            name: 'longDescription',
            title: 'Long Description (Legacy/Fallback)',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'registrationLink',
            title: 'Registration Link',
            type: 'url',
        }),
        defineField({
            name: 'whatsappLink',
            title: 'WhatsApp Join Link',
            description: 'Link to the WhatsApp group for this event (displayed after registration).',
            type: 'url',
        }),
        defineField({
            name: 'image',
            title: 'Event Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
    ],
})
