import { Telegraf, message } from 'telegraf-light'

import { registerDocumentHandler } from '../handlers/document'

export function createBot(token: string): { bot: Telegraf } {
    const bot = new Telegraf(token)

    registerDocumentHandler(bot)
    return { bot }
}
