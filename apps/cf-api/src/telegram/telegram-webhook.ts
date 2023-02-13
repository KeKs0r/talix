import { Hono } from 'hono'
import { createBot } from 'telegram-bot'

import { Env } from '../env.types'

export function telegramWebhook(app: Hono<Env>) {
    console.time('createBot')
    const { bot } = createBot('5894058794:AAHUjJ26zJdJ0EbsmgegyeJtaYp5bpWrvJs')
    console.timeEnd('createBot')
    app.post('/telegram/webhook', async (c) => {
        const body = await c.req.json<any>()
        console.log('Request')
        // console.log('body')
        // console.log(body)
        const result = await bot.handleUpdate(body)
        return c.text('ok')
    })
}
