import { Action } from '@chute/core'
import type { Filter, Update } from 'telegraf-light'

export class TelegramAction<
    Id extends string = string,
    Input = any,
    Output = any,
    Context = any,
    U extends Update = Update
> extends Action<Id, Input, Output, Context> {
    readonly filter: Filter<U>
    constructor({
        actionId,
        handler,
        filter,
    }: {
        actionId: Id
        handler: (input: Input, deps: Context) => Output
        filter: Filter<U>
    }) {
        super({ actionId, handler })
        this.filter = filter
    }
}

export function isTelegramAction(action: any): action is TelegramAction {
    return Boolean((action as TelegramAction).filter)
}
