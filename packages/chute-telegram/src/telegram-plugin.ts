import { BaseContext, Chute, HttpAction } from '@chute/core'
import { asFunction } from 'awilix'
import { Bot, Composer, Context } from 'grammy/web'
import { diary } from 'diary'

const logger = diary('telegram:plugin')

type TelegramPluginOptions = {
    path?: string
}

export type TelegramPluginContext = {
    telegram: Bot
    TELEGRAM_BOT_TOKEN: string
}
type FullTelegramPluginContext = TelegramPluginContext & BaseContext

export function telegramPlugin(options?: TelegramPluginOptions) {
    const { path = '/telegram/webhook' } = options || {}

    function registerTelegram<T extends FullTelegramPluginContext = FullTelegramPluginContext>(
        app: Chute<T>
    ) {
        app.container.register(
            'telegram',
            asFunction(({ TELEGRAM_BOT_TOKEN }) => new Bot(TELEGRAM_BOT_TOKEN)).singleton()
        )

        const upgraded = app.registerType<Composer<Context>>('telegram')

        const webhookAction = new HttpAction({
            actionId: 'telegram:webhook',
            httpPath: path,
            async handler(input, cradle: T) {
                const { TELEGRAM_BOT_TOKEN } = cradle
                const bot = new Bot(TELEGRAM_BOT_TOKEN)
                //@TODO: Register the CRADLE on the context
                const listeners = upgraded.getOfType('telegram')
                listeners.forEach((listener) => {
                    bot.use(listener)
                })
                await bot.handleUpdate(input)
                return { status: 'ok' }
            },
        })
        return upgraded.registerAction(webhookAction)
    }
    return registerTelegram
}
