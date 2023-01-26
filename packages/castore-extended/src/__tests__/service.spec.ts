import { describe, it, expect, vi } from 'vitest'

import { connectServicesActions, Service } from '../service'

import {
    counterEventStore,
    counterCreatedEventMock,
    counterCreatedAction,
} from './counter-event-store'

describe('Service Wiring', () => {
    it('Can wire services and connection actions', async () => {
        const spy = vi.fn()
        counterCreatedAction.register(spy)
        const service: Service = {
            name: 'mockService',
            stores: {
                [counterEventStore.eventStoreId]: counterEventStore,
            },
            actions: {
                counterCreatedAction,
            },
        }

        connectServicesActions([service])
        await counterEventStore.pushEvent(counterCreatedEventMock)
        expect(spy).toHaveBeenCalled()
    })
})
