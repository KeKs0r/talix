import { Telegraf } from 'telegraf'
import { TELEGRAM_BOT_TOKEN } from './env'
import { registerDocumentHandler } from '../handlers/document'
import { App, createApp } from './app'

export function createBot(): { bot: Telegraf; app: App } {
    const bot = new Telegraf(TELEGRAM_BOT_TOKEN)
    const app = createApp()
    registerDocumentHandler(bot, app)
    return { bot, app }
}
