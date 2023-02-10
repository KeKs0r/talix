import { Hono } from 'hono'
// import { createBot } from 'telegram-bot'

import { Env } from '../env.types'

export function telegramWebhook(app: Hono<Env>) {
    // const { bot } = createBot()
    app.post('/telegram/webhook', async (c) => {
        const body = await c.req.json<any>()
        // bot.handleUpdate(body)
        console.log(body)
        return c.text('ok')
    })
}
