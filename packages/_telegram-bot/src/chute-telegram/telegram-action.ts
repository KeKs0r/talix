import { Action, BaseContext } from '@chute/core'
import { Filter, NarrowedContext, Context, Telegraf, message } from 'telegraf-light'

const telegraf = new Telegraf()
telegraf.on(message('document'), (ctx) => {})

export type GetUpdate<F> = F extends Filter<infer U> ? U : never
export class TelegramAction<
    F extends Filter = Filter,
    Id extends string = string,
    C extends BaseContext = BaseContext
> extends Action<Id, NarrowedContext<Context, GetUpdate<F>>, void, C> {
    readonly filter: F
    constructor({
        actionId,
        handler,
        filter,
    }: {
        actionId: Id
        filter: F
        handler: (ctx: NarrowedContext<Context, GetUpdate<F>>, deps: C) => void
    }) {
        super({ actionId, handler })
        this.filter = filter
    }
}

export function isTelegramAction(action: any): action is TelegramAction {
    return Boolean((action as TelegramAction).filter)
}
