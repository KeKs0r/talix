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
        app.container.register(
            'telegraf',
            asFunction((cradle: Record<string, string>) => {
                const apiKey = cradle[envKeyName]
                ok(apiKey, `Missing ${envKeyName} in environment variables`)
                return new Telegraf(apiKey)
            })
        )
        const webhookAction = new HttpAction({
            actionId: 'telegram:webhook',
            httpPath: path,
            handler(input, { telegraf }: { telegraf: Telegraf }) {
                return telegraf.handleUpdate(input)
            },
        })
        app.registerAction(webhookAction)
        actions.forEach((telegramAction) => {
            const bot = app.container.resolve('telegraf')
            bot.on(telegramAction.filter, telegramAction.handler)
        })
    }
}
