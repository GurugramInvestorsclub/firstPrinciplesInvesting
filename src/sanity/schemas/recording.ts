import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'recording',
    title: 'Member Recording',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'date',
            title: 'Recording Date',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'recordingUrl',
            title: 'Recording Link / URL',
            description: 'Link where members can watch or access the recording.',
            type: 'url',
            validation: (Rule) =>
                Rule.required().uri({
                    scheme: ['http', 'https'],
                }),
        }),
        defineField({
            name: 'description',
            title: 'Description / Notes',
            description: 'Brief overview of key topics or takeaways discussed in this session.',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'thumbnail',
            title: 'Thumbnail / Cover Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'duration',
            title: 'Duration',
            description: 'e.g. "1 hr 30 mins" or "45 mins"',
            type: 'string',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'date',
            media: 'thumbnail',
        },
        prepare(selection) {
            const { title, subtitle, media } = selection
            const formattedDate = subtitle
                ? new Date(subtitle).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                  })
                : 'No Date'
            return {
                title: title,
                subtitle: formattedDate,
                media: media,
            }
        },
    },
})
