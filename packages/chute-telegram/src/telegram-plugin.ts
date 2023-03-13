import { BaseContext, Chute, HttpAction } from '@chute/core'
import { asFunction } from 'awilix'
import { Bot, Composer, Context } from 'grammy/web'
import { diary } from 'diary'

import { FileUrlPluginFlavor, fileUrlMiddleware } from './util-ctx-file-url'

const logger = diary('telegram:plugin')

type TelegramPluginOptions = {
    path?: string
}

export type TelegramPluginContext = {
    telegram: Bot
    TELEGRAM_BOT_TOKEN: string
}
type FullTelegramPluginContext = TelegramPluginContext & BaseContext

export type BotContext = Context & {
    cradle: FullTelegramPluginContext
} & FileUrlPluginFlavor

export function telegramPlugin(options?: TelegramPluginOptions) {
    const { path = '/telegram/webhook' } = options || {}

    function registerTelegram<T extends FullTelegramPluginContext = FullTelegramPluginContext>(
        app: Chute<T>
    ) {
        app.container.register(
            'telegram',
            asFunction(({ TELEGRAM_BOT_TOKEN }) => new Bot(TELEGRAM_BOT_TOKEN)).singleton()
        )

        app.registerTag('telegram')

        const webhookAction = new HttpAction({
            actionId: 'telegram:webhook',
            httpPath: path,
            async handler(input, cradle: T) {
                const { TELEGRAM_BOT_TOKEN } = cradle
                const bot = await createBot(TELEGRAM_BOT_TOKEN, app, cradle)
                await bot.handleUpdate(input)
                return { status: 'ok' }
            },
        })
        app.registerAction(webhookAction)
        return app
    }
    return registerTelegram
}

async function createBot<T extends FullTelegramPluginContext = FullTelegramPluginContext>(
    token: string,
    chute: Chute<T>,
    scope: T
) {
    const bot = new Bot<BotContext>(token)

    bot.use((ctx, next) => {
        ctx.cradle = scope
        return next()
    })
    bot.use(fileUrlMiddleware(token))

    const listeners = chute.getForTag('telegram')
    listeners.forEach((listener: any) => {
        bot.use(listener)
    })
    /**
     * @TODO: Provide the config directly, so we dont need to pull
     */
    await bot.init()
    return bot
}
