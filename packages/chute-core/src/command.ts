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
        eventAlreadyExistsRetries,
        onEventAlreadyExists,
        handler,
    }: {
        commandId: C
        eventAlreadyExistsRetries?: number
        onEventAlreadyExists?: OnEventAlreadyExistsCallback
        handler: (input: I, ...context: T) => Promise<O>
    }) {
        super({
            commandId,
            requiredEventStores: [] as unknown as E,
            eventAlreadyExistsRetries,
            onEventAlreadyExists,
            /**
             * @TODO: Had to remove the required evenstores, gonna have to add
             * this in a different way to its resolved via the
             */
            handler: (input: I, requiredEventStores: $E, ...context: T) =>
                handler(input, ...context),
        })
        // this.run = this.run.bind(this)
    }
    run(input: I, ...context: T): Promise<O> {
        return this.handler(input, [] as unknown as $E, ...context)
    }
    deps?: T
}
