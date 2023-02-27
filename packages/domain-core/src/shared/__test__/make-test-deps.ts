import { createContainer, asClass, asValue, AwilixContainer, asFunction } from 'awilix'
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter'
import { Command, GetCommandInput } from '@chute/core'
import { MockFileStorage } from 'file-storage'
import { RuntimeContext } from '@chute/cf-runtime'
import Emittery from 'emittery'

export function makeTestDependencies(
    overwrite?: Parameters<AwilixContainer['register']>[0]
): RuntimeContext {
    const container = createContainer<RuntimeContext>()
    container.register('emitter', asValue(new Emittery()))
    container.register('storageAdapter', asClass(InMemoryStorageAdapter))
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
    if (!overwrite?.initialEvents) {
        container.register('initialEvents', asValue([]))
    }

    return container.cradle
}
