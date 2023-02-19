import { Chute, HttpAction } from '@chute/core'
import { asFunction } from 'awilix'
import { Telegraf } from 'telegraf-light'
import ok from 'tiny-invariant'

import { TelegramAction } from './telegram-action'

type TelegramPluginOptions = {
    path?: string
    envKeyName?: string
}
/**
 * @TODO: actions should be declarative from the app,
 * so they can be registered in the app and then gathered here.
 * This will require a 2 step plugin registration process (with a next call, maybe check HAPI)
 */
export function telegramPlugin(actions: TelegramAction[], options?: TelegramPluginOptions) {
    const { path = '/telegram/webhook', envKeyName = 'TELEGRAM_BOT_TOKEN' } = options || {}
    return (app: Chute) => {
        app.container.register('telegraf', asFunction(() => new Telegraf()).singleton())
        const webhookAction = new HttpAction({
            actionId: 'telegram:webhook',
            httpPath: path,
            async handler(
                input,
                cradle: { telegraf: Telegraf; TELEGRAM_BOT_TOKEN: string } & Record<string, any>
            ) {
                const telegraf = cradle.telegraf
                const token = cradle[envKeyName]
                ok(token, `Missing ${envKeyName} in the environment`)
                await telegraf.handleUpdate(input, { token })
                return { status: 'ok' }
            },
        })
        app.registerAction(webhookAction)
        actions.forEach((telegramAction) => {
            const bot = app.container.resolve('telegraf')
            bot.on(telegramAction.filter, telegramAction.handler)
        })
    }
}
