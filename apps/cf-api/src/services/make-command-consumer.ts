import { $Contravariant } from '@castore/core'
import { Command, EventStore, GetCommandInput } from 'castore-extended'
import { ok } from 'common'

export function makeCommandConsumer<
    C extends string = string,
    E extends EventStore[] = EventStore[],
    $E extends EventStore[] = $Contravariant<E, EventStore[]>,
    I extends { aggregateId: string } = { aggregateId: string },
    O = any,
    T extends any[] = any[]
>(command: Command<C, E, $E, I, O, T>, entity: DurableObjectNamespace) {
    return async (input: I): Promise<O> => {
        const { aggregateId } = input
        let id = entity.idFromName(aggregateId)
        const stub = entity.get(id)

        const commandName = encodeURIComponent(command.commandId)
        const req = new Request(new URL(`https://durableobject?command=${command}`), {
            method: 'POST',
            body: JSON.stringify(input),
        })
        console.log(stub.id)
        const entityResponse = await stub.fetch(req)
        ok(entityResponse.status === 200, `Entity response status: ${entityResponse.status}`)
        const output = await entityResponse.json<O>()
        return output
    }
}
