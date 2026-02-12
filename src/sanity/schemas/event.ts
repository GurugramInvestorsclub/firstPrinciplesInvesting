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
            name: 'image',
            title: 'Event Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
    ],
})
