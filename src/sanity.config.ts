import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from '@/sanity/schemas'
import { PublishWithFeatured } from '@/sanity/actions/publishWithFeatured'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

export default defineConfig({
    basePath: '/studio',
    projectId,
    dataset,
    plugins: [structureTool(), visionTool()],
    schema: {
        types: schemaTypes,
    },
    document: {
        actions: (prev, context) => {
            if (context.schemaType === 'post') {
                return prev.map((originalAction) =>
                    originalAction.action === 'publish' ? PublishWithFeatured : originalAction
                )
            }
            return prev
        },
    },
})
