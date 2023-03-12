import { BaseContext, BaseRegistryMap, Chute, Plugin, $Contravariant } from '@chute/core'
import { Composer, Context } from 'grammy'

import documentUpload from './handlers/document-upload'

type TelegramRegistry = BaseRegistryMap & Record<'telegram', Composer<Context>>

export function telegramBot<
    C extends BaseContext = BaseContext,
    R extends TelegramRegistry = TelegramRegistry
>() {
    const comp = new Composer()
    comp.use(documentUpload)

    function registerTelegram(chute: Chute<C, R>) {
        chute.registerOfType('telegram', comp)
        return chute
    }

    return registerTelegram
}
