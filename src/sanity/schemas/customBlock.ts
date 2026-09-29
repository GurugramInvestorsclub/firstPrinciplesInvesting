import { defineArrayMember } from 'sanity'
import { HighlightIcon, HighlightDecorator } from '../components/HighlightDecorator'

export const customBlock = defineArrayMember({
    type: 'block',
    styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'H5', value: 'h5' },
        { title: 'H6', value: 'h6' },
        { title: 'Quote', value: 'blockquote' },
    ],
    lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
    ],
    marks: {
        decorators: [
            { title: 'Strong', value: 'strong' },
            { title: 'Emphasis', value: 'em' },
            { title: 'Code', value: 'code' },
            { title: 'Underline', value: 'underline' },
            { title: 'Strike', value: 'strike-through' },
            {
                title: 'Highlight',
                value: 'highlight',
                icon: HighlightIcon,
                component: HighlightDecorator,
            },
        ],
        annotations: [
            {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                    {
                        name: 'href',
                        type: 'url',
                        title: 'URL',
                        validation: (Rule) =>
                            Rule.uri({
                                scheme: ['http', 'https', 'mailto', 'tel'],
                                allowRelative: true,
                            }),
                    },
                ],
            },
        ],
    },
})
