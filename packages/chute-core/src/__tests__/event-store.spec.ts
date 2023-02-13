import { describe, it, expect, vi } from 'vitest'

import {
    counterEventStore,
    counterCreatedEvent,
    counterIncrementedEventMock,
    counterCreatedEventMock,
} from './counter-event-store'

describe('Extended EventStore', () => {
    it('Can attach eventlistener', async () => {
        const eventSpy = vi.fn()
        counterEventStore.on(counterCreatedEvent.type, eventSpy)

        await counterEventStore.pushEvent(counterIncrementedEventMock)
        expect(eventSpy).not.toHaveBeenCalled()

        const eventPromise = counterEventStore.pushEvent(counterCreatedEventMock)
        expect(eventSpy).not.toHaveBeenCalled()
        await eventPromise
        expect(eventSpy).toHaveBeenCalled()
    })
})
