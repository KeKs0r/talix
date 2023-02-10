import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'

// import { registerDocumentHandler } from '../handlers/document'

import { TELEGRAM_BOT_TOKEN } from './env'

export function createBot(): { bot: Telegraf } {
    const bot = new Telegraf(TELEGRAM_BOT_TOKEN)

    bot.on(message('text'), async (ctx) => {
        await ctx.reply(`Hello ${ctx.state.role}`)
    })

    // registerDocumentHandler(bot, app)
    return { bot }
}
