import {
    $Contravariant,
    Command as BaseCommand,
    EventStore,
    OnEventAlreadyExistsCallback,
} from '@castore/core'
import { ok } from 'common'

export class Command<
    C extends string = string,
    E extends EventStore[] = EventStore[],
    $E extends EventStore[] = $Contravariant<E, EventStore[]>,
    I = any,
    O = any,
    T extends any[] = any[]
> extends BaseCommand<C, E, $E, I, O, T> {
    constructor({
        commandId,
        requiredEventStores,
        eventAlreadyExistsRetries,
        onEventAlreadyExists,
        handler,
    }: {
        commandId: C
        requiredEventStores: E
        eventAlreadyExistsRetries?: number
        onEventAlreadyExists?: OnEventAlreadyExistsCallback
        handler: (input: I, eventStores: $E, ...context: T) => Promise<O>
    }) {
        super({
            commandId,
            requiredEventStores,
            eventAlreadyExistsRetries,
            onEventAlreadyExists,
            handler,
        })
        this.run = this.run.bind(this)
        this.register = this.register.bind(this)
    }
    deps?: T
    eventStores?: $E
    run(input: I) {
        ok(
            this.deps,
            `Can only call run after registering the action dependencies in ${this.commandId}`
        )
        ok(this.eventStores, 'Can only call run after registering the event stores')
        return this.handler(input, this.eventStores, ...this.deps)
    }
    register(eventStores: $E, ...deps: T) {
        this.eventStores = eventStores
        this.deps = deps
        return this
    }
}
