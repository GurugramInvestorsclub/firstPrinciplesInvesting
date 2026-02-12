import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'testimonial',
    title: 'Testimonial',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'role',
            title: 'Role',
            type: 'string',
        }),
        defineField({
            name: 'quote',
            title: 'Quote',
            type: 'text',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'photo',
            title: 'Photo',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
    ],
})
