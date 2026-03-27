import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'cex1nk7w',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-02-12',
})

async function checkEvents() {
  const events = await client.fetch('*[_type == "event"]{title, slug, image}')
  console.log(JSON.stringify(events, null, 2))
}

checkEvents()
