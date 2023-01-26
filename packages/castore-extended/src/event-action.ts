import assert from 'assert'

import { EventDetail } from '@castore/core'

import { Action } from './action'

export class EventAction<
    Id extends string = string,
    Event extends EventDetail = EventDetail,
    Context = any
> {
    readonly actionId: Id
    readonly trigger: Event['type']
    handler: (event: Event, deps: Context) => Promise<void> | void
    deps?: Context
    _types?: {
        Event: Event
    }
    constructor({
        actionId,
        trigger,
        handler,
    }: {
        actionId: Id
        trigger: Event['type']
        handler: (event: Event, deps: Context) => Promise<void> | void
    }) {
        this.actionId = actionId
        this.trigger = trigger
        this.handler = handler
        this.run = this.run.bind(this)
        this.register = this.register.bind(this)
    }
    run(event: Event) {
        assert(this.deps, 'Can only call run after registering the action dependencies')
        return this.handler(event, this.deps)
    }
    register(deps: Context) {
        this.deps = deps
    }
}

export function isEventAction(action: EventAction | Action): action is EventAction {
    return Boolean((action as EventAction).trigger)
}
