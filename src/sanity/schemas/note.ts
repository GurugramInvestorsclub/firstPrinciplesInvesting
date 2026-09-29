import { defineField, defineType } from 'sanity'
import { customBlock } from './customBlock'

export default defineType({
    name: 'note',
    title: 'Member Note',
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
            title: 'Note Date',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'content',
            title: 'Content',
            type: 'array',
            of: [customBlock, { type: 'image' }],
            validation: (Rule) => Rule.required(),
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'date',
        },
        prepare(selection) {
            const { title, subtitle } = selection
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
            }
        },
    },
})
