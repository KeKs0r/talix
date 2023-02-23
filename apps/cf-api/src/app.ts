import { Chute, healthCheckPlugin } from '@chute/core'
import { RuntimeContext } from '@chute/cf-runtime'
import { documentService, voucherService } from 'domain-core'
import { telegramPlugin, TelegramPluginContext } from 'telegram-bot'
// import { ocrService } from 'ocr-document'

import { Env } from './env.types'

type Context = RuntimeContext & Env['Bindings'] & TelegramPluginContext

export function makeApp() {
    const chute = new Chute<Context>()
    chute.registerPlugin(documentService)
    chute.registerPlugin(voucherService)
    chute.registerPlugin(telegramPlugin)
    // chute.registerPlugin(ocrService)
    chute.registerPlugin(healthCheckPlugin())
    return chute.build()
}
