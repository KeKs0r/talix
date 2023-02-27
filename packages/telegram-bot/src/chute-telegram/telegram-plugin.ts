import { BaseContext, Chute, HttpAction } from '@chute/core'
import { asFunction } from 'awilix'
import { Telegraf, Context as TelegrafBaseContext, Update } from 'telegraf-light'
import ok from 'tiny-invariant'
import { diary } from 'diary'

import { TelegramAction } from './telegram-action'

const logger = diary('telegram:plugin')

type TelegramPluginOptions = {
    path?: string
}

export type TelegramPluginContext = {
    telegraf: Telegraf<TelegrafContext>
    TELEGRAM_BOT_TOKEN: string
    DOCUMENTS_BUCKET: R2Bucket
}
type FullTelegramPluginContext = TelegramPluginContext & BaseContext

class TelegrafContext extends TelegrafBaseContext<Update> {
    cradle?: FullTelegramPluginContext
}

/**
 * @TODO: actions should be declarative from the app,
 * so they can be registered in the app and then gathered here.
 * This will require a 2 step plugin registration process (with a next call, maybe check HAPI)
 */
export function telegramPlugin(actions: TelegramAction[], options?: TelegramPluginOptions) {
    const { path = '/telegram/webhook' } = options || {}

    function registerTelegram<T extends FullTelegramPluginContext = FullTelegramPluginContext>(
        app: Chute<T>
    ) {
        app.container.register(
            'telegraf',
            asFunction(() => new Telegraf<TelegrafContext>()).singleton()
        )

        const webhookAction = new HttpAction({
            actionId: 'telegram:webhook',
            httpPath: path,
            async handler(input, cradle: T) {
                console.log('')
                console.log('')
                console.log('')
                console.log('')

                console.log(JSON.stringify(input, null, 4))
                console.log('')
                console.log('')
                console.log('')
                console.log('')
                console.log('')

                const telegraf = cradle.telegraf
                const token = cradle.TELEGRAM_BOT_TOKEN
                ok(token, `Missing TELEGRAM_BOT_TOKEN in the environment`)
                await telegraf.handleUpdate(input, { cradle }, token)
                return { status: 'ok' }
            },
        })
        app.registerAction(webhookAction)
        actions.forEach((telegramAction) => {
            const bot: Telegraf<TelegrafContext> = app.container.resolve('telegraf')
            bot.on(telegramAction.filter, async (a) => {
                try {
                    const cradle = a.cradle
                    ok(cradle, 'Cradle not defined')
                    logger.info(a.updateType, a.update)
                    await cradle.runAction(telegramAction, a)
                } catch (e) {
                    logger.error(e)
                    console.error(e)
                }
            })
        })
    }
    return registerTelegram
}
