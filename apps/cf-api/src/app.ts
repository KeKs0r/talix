import { Chute, healthCheckPlugin } from '@chute/core'
import { RuntimeContext } from '@chute/cf-runtime'
import { documentService, voucherService } from 'domain-core'
import { telegramPlugin, TelegramPluginContext } from '@chute/telegram'
import { ocrService } from 'ocr-document'
import { telegramBot } from 'telegram-bot'

import { Env } from './env.types'

type Context = RuntimeContext & Env['Bindings'] & TelegramPluginContext

export function makeApp() {
    const chute = new Chute<Context>()
    const chute1 = chute
        .registerPlugin(telegramPlugin())
        .registerPlugin(telegramBot())
        .registerPlugin(documentService)
        .registerPlugin(voucherService)
        .registerPlugin(ocrService)
        .registerPlugin(healthCheckPlugin())
        .build()
}
