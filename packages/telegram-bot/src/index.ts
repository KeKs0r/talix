import { BaseContext, Chute } from '@chute/core'
import { BotContext } from '@chute/telegram'
import { Composer } from 'grammy/web'

import documentUpload from './handlers/document-upload'

export function telegramBot<C extends BaseContext = BaseContext>() {
    const comp = new Composer<BotContext>()
    comp.use(documentUpload)

    function registerTelegram(chute: Chute<C>) {
        chute.registerTagged('telegram', comp)
        return chute
    }

    return registerTelegram
}
