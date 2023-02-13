import { Command, GetCommandInput, isEventAction, Service } from '@chute/core'
import { RuntimeDependencies } from 'domain-core'
import { FileStorage, R2FileStorage } from 'file-storage'
import { ulidFactory } from 'ulid-workers'

import { Bindings, Env } from '../env.types'

import { CfStorageAdapter } from './cf-storage-adapter'

/**
 * Returns a map of observed events, and actions that should be triggered by them
 */
export function getEventMap(services: Service[]) {
    const eventActions = services.flatMap((service) => {
        return service.actions?.filter(isEventAction) ?? []
    })
    const eventMap = eventActions.reduce((acc: Record<string, string[]>, action) => {
        if (!acc[action.eventTrigger]) {
            acc[action.eventTrigger] = []
        }
        acc[action.eventTrigger].push(action.actionId)
        return acc
    }, {})
    return eventMap
}

export function getActionsById(services: Service[]) {
    const actions = services.flatMap((service) => service.actions ?? [])
    return Object.fromEntries(actions.map((action) => [action.actionId, action]))
}

export function makeDependencies(env: Bindings): RuntimeDependencies {
    let fileStorage: FileStorage
    let generateId: () => string

    const deps: any = {
        get fileStorage() {
            if (!fileStorage) {
                fileStorage = new R2FileStorage(env.DOCUMENTS_BUCKET)
            }
            return fileStorage
        },
        get generateId() {
            if (!generateId) {
                generateId = ulidFactory()
            }
            return generateId
        },
    }

    function run<C extends Command>(command: C, input: GetCommandInput<C>) {
        return command.run(input, deps)
    }
    deps.run = run

    return deps as RuntimeDependencies
}

export function bindServices(services: Service[], env: Env['Bindings']) {
    services.forEach((service) => {
        if (!service.store.storageAdapter) {
            service.store.storageAdapter = new CfStorageAdapter(env.DURABLE_ENTITY)
        }
    })
}
