import { EventDetail } from '@castore/core'

export class EventAction<
    Id extends string = string,
    Event extends EventDetail = EventDetail,
    Context = any
> {
    readonly actionId: Id
    readonly trigger: Event['type']
    handler: (event: Event, deps: Context) => Promise<void>
    constructor({
        actionId,
        trigger,
        handler,
    }: {
        actionId: Id
        trigger: Event['type']
        handler: (event: Event, deps: Context) => Promise<void>
    }) {
        this.actionId = actionId
        this.trigger = trigger
        this.handler = handler
    }
}
