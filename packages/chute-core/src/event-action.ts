import { EventType } from '@castore/core'

import { Action } from './action'
import { BaseContext } from './base-context'

export class EventAction<
    Id extends string = string,
    Type extends EventType = EventType,
    Context extends BaseContext = BaseContext
> extends Action<Id, Event, void, Context> {
    readonly eventTrigger: Type['type']
    constructor({
        actionId,
        handler,
        eventTrigger,
    }: {
        actionId: Id
        handler: (event: NonNullable<Type['_types']>['detail'], deps: Context) => void
        eventTrigger: Type['type']
    }) {
        super({ actionId, handler })
        this.eventTrigger = eventTrigger
    }
}

export function isEventAction(action: Action): action is EventAction {
    return Boolean((action as EventAction).eventTrigger)
}
