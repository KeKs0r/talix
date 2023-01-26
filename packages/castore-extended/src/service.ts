import assert from 'assert'

import { EventStore } from './event-store'
import { EventAction, isEventAction } from './event-action'
import { Command } from './command'
import { Action } from './action'

export interface Service {
    name: string
    stores?: Record<string, EventStore>
    actions?: Record<string, EventAction | Action>
    commands?: Record<string, Command>
}

export function connectServicesActions(services: Service[]) {
    const storesByName: Record<string, EventStore> = services.reduce((acc, service) => {
        return {
            ...acc,
            ...service.stores,
        }
    }, {})
    services.forEach((service) =>
        Object.values(service.actions || {}).forEach((action) => {
            if (isEventAction(action)) {
                const eventTrigger = action.trigger
                const [storeName] = eventTrigger.split(':')
                const store = storesByName[storeName]
                assert(
                    store,
                    `EventStore ${storeName} not found. Got only ${Object.keys(storesByName).join(
                        ','
                    )}`
                )
                store.on<NonNullable<(typeof action)['_types']>['Event']>(eventTrigger, action.run)
            }
        })
    )
}
