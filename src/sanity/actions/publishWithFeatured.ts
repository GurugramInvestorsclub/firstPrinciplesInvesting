import { DocumentActionProps, useDocumentOperation } from 'sanity'
import { useState, useEffect } from 'react'
import { useClient } from 'sanity'

export function PublishWithFeatured(props: DocumentActionProps) {
    const { patch, publish } = useDocumentOperation(props.id, props.type)
    const client = useClient({ apiVersion: '2023-05-03' })
    const [isPublishing, setIsPublishing] = useState(false)

    useEffect(() => {
        if (isPublishing && !props.draft) {
            setIsPublishing(false)
        }
    }, [props.draft, isPublishing])

    return {
        disabled: !!publish.disabled,
        label: isPublishing ? 'Publishing...' : 'Publish',
        onHandle: async () => {
            setIsPublishing(true)

            // Check if the current document is marked as featured
            const isFeatured = (props.draft || props.published)?.isFeatured

            if (isFeatured) {
                // Find other featured posts
                const query = `*[_type == "post" && isFeatured == true && _id != $id]`
                const params = { id: props.id.replace('drafts.', '') }
                const others = await client.fetch(query, params)

                // Unfeature them
                const transaction = client.transaction()
                others.forEach((doc: any) => {
                    transaction.patch(doc._id, (p) => p.set({ isFeatured: false }))
                })
                await transaction.commit()
            }

            // Perform the standard publish
            publish.execute()
            props.onComplete()
        },
    }
}
