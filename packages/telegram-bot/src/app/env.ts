import assert from 'assert'

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
assert(TELEGRAM_BOT_TOKEN, 'TELEGRAM_BOT_TOKEN is missing')
