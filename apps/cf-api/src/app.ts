import { Chute, healthCheckPlugin } from '@chute/core'
import { documentService, RuntimeContext, voucherService } from 'domain-core'
import { telegramPlugin, TelegramPluginContext } from 'telegram-bot'

import { Env } from './env.types'

type Context = RuntimeContext & Env['Bindings'] & TelegramPluginContext

export function makeApp() {
    const chute = new Chute<Context>()
    chute.registerPlugin(documentService)
    chute.registerPlugin(voucherService)
    chute.registerPlugin(telegramPlugin)
    chute.registerPlugin(healthCheckPlugin())
    return chute.build()
}
