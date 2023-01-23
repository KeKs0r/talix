import { createBot } from './app/bot'

async function main() {
    const { bot } = createBot()

    bot.launch()

    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}
main()
