import {
    $Contravariant,
    Command as BaseCommand,
    EventStore,
    OnEventAlreadyExistsCallback,
} from '@castore/core'

export type GetCommandInput<Cmd> = Cmd extends Command<any, any, any, infer Input> ? Input : never
export type GetCommandOutput<Cmd> = Cmd extends Command<any, any, any, any, infer Output>
    ? Output
    : never

export type CommandHandler<Cmd extends Command> = (
    input: GetCommandInput<Cmd>
) => Promise<GetCommandOutput<Cmd>>

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
    }
    deps?: T
    run(input: I, deps: T) {
        return this.handler(input, this.requiredEventStores as any, ...deps)
    }
}
