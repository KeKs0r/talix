import { describe, it, expect, vi } from 'vitest'

import { connectServicesActions } from '../service'

import {
    counterEventStore,
    counterCreatedEventMock,
    counterCreatedAction,
} from './counter-event-store'

describe('Service Wiring', () => {
    it('Can wire services and connection actions', async () => {
        const spy = vi.fn()
        const service = {
            stores: [counterEventStore],
            actions: [counterCreatedAction],
        }
        counterCreatedAction.register(spy)
        connectServicesActions([service])
        await counterEventStore.pushEvent(counterCreatedEventMock)
        expect(spy).toHaveBeenCalled()
    })
})
