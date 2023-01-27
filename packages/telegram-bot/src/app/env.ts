import { ok } from 'common'
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
ok(TELEGRAM_BOT_TOKEN, 'TELEGRAM_BOT_TOKEN is missing')
