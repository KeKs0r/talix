import { Hono } from 'hono'

import { Env } from './env.types'

const app = new Hono<Env>()

app.get('/check', (c) => {
    return c.text(`Hello World!`)
})

app.get('/r2', async (c) => {
    const bucket = c.env.DOCUMENTS
    const file = await bucket.get('rolling-dog.gif')

    return c.json({ key: file?.key })
})

export default app
