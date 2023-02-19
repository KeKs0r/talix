import { asValue } from 'awilix'
import { Chute, healthCheckPlugin } from '@chute/core'
import { documentService, voucherService } from 'domain-core'
import { telegramPlugin } from 'telegram-bot'

export function makeApp() {
    const chute = new Chute()
    chute.container.register({
        TELEGRAM_BOT_TOKEN: asValue(global.TELEGRAM_BOT_TOKEN),
    })
    chute.registerPlugin(documentService)
    chute.registerPlugin(voucherService)
    chute.registerPlugin(telegramPlugin)
    chute.registerPlugin(healthCheckPlugin())
    return chute
}
