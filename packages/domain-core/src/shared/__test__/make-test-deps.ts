import { createContainer, asClass, asValue, AwilixContainer } from 'awilix'
import { Command, GetCommandInput } from '@chute/core'
import { MockFileStorage } from 'file-storage'
import { RuntimeContext } from '@chute/cf-runtime'

export function makeTestDependencies(
    overwrite?: Parameters<AwilixContainer['register']>[0]
): RuntimeContext {
    const container = createContainer<RuntimeContext>()
    container.register('fileStorage', asClass(MockFileStorage))
    container.register(
        'generateId',
        asValue(() => `${Math.round(Math.random() * 99999999)}`)
    )
    function runCommand<C extends Command>(command: C, input: GetCommandInput<C>) {
        const stores = command.requiredEventStores.map((s) => container.resolve(s.eventStoreId))
        return command.handler(input, stores, container.cradle)
    }
    function runAction() {
        throw new Error('Not implemented')
    }
    container.register('runCommand', asValue(runCommand))
    container.register('runAction', asValue(runAction))
    if (overwrite) {
        container.register(overwrite)
    }

    return container.cradle
}
