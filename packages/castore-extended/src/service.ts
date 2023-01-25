import assert from 'assert'

import { EventStore } from './event-store'
import { EventAction } from './event-action'

export interface Service {
    stores: EventStore[]
    actions: EventAction[]
}

export function connectServicesActions(services: Service[]) {
    const storesByName = Object.fromEntries(
        services.flatMap((service) => service.stores.map((store) => [store.eventStoreId, store]))
    )
    services.forEach((service) =>
        service.actions.forEach((action) => {
            const eventTrigger = action.trigger
            const [storeName] = eventTrigger.split(':')
            const store = storesByName[storeName]
            assert(
                store,
                `EventStore ${storeName} not found. Got only ${Object.keys(storesByName).join(',')}`
            )
            store.on<NonNullable<(typeof action)['_types']>['Event']>(eventTrigger, action.run)
        })
    )
}
