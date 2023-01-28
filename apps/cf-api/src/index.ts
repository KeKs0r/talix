import { Hono } from 'hono'
import { Bindings } from 'hono/dist/types/types'

import { Env } from './env.types'
import { makeDocumentRoutes } from './services/document-service'
import { queue } from './queue/handler'

export { DocumentEntity } from './services/durable-store'

const app = new Hono<Env>()

app.get('/check', (c) => {
    return c.text(`Hello World!`)
})

app.get('/r2', async (c) => {
    const bucket = c.env.DOCUMENTS_BUCKET
    const file = await bucket.get('rolling-dog.gif')

    return c.json({ key: file?.key })
})
makeDocumentRoutes(app)

export default {
    fetch: app.fetch,
    queue,
}
