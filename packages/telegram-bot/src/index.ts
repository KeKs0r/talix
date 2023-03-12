import { BaseContext, Chute } from '@chute/core'
import { Composer } from 'grammy'

import documentUpload from './handlers/document-upload'

export function telegramBot<C extends BaseContext = BaseContext>() {
    const comp = new Composer()
    comp.use(documentUpload)

    function registerTelegram(chute: Chute<C>) {
        chute.registerTagged('telegram', comp)
        return chute
    }

    return registerTelegram
}
