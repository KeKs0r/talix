import { vi } from 'vitest'
import { EventType, EventTypeDetail, StorageAdapter } from '@castore/core'

import { EventStore } from '../event-store'

export const pushEventMock = vi.fn()
export const getEventsMock = vi.fn()
export const listAggregateIdsMock = vi.fn()
export const putSnapshotMock = vi.fn()
export const getLastSnapshotMock = vi.fn()
export const listSnapshotsMock = vi.fn()

export const mockStorageAdapter: StorageAdapter = {
    pushEvent: pushEventMock,
    getEvents: getEventsMock,
    listAggregateIds: listAggregateIdsMock,
    putSnapshot: putSnapshotMock,
    getLastSnapshot: getLastSnapshotMock,
    listSnapshots: listSnapshotsMock,
}

export const counterCreatedEvent = new EventType<'COUNTER_CREATED', { initialCount?: number }>({
    type: 'COUNTER_CREATED',
})

export const counterIncrementedEvent = new EventType<'COUNTER_INCREMENTED'>({
    type: 'COUNTER_INCREMENTED',
})

export const counterDeletedEvent = new EventType<'COUNTER_DELETED'>({
    type: 'COUNTER_DELETED',
})

export type CounterEventsDetails =
    | EventTypeDetail<typeof counterCreatedEvent>
    | EventTypeDetail<typeof counterIncrementedEvent>
    | EventTypeDetail<typeof counterDeletedEvent>

export type CounterAggregate = {
    aggregateId: string
    version: number
    count: number
    status: string
}

export const counterIdMock = 'counterId'
export const counterCreatedEventMock: CounterEventsDetails = {
    aggregateId: counterIdMock,
    version: 1,
    type: 'COUNTER_CREATED',
    timestamp: '2022',
    payload: {},
}
export const counterIncrementedEventMock: CounterEventsDetails = {
    aggregateId: counterIdMock,
    version: 2,
    type: 'COUNTER_INCREMENTED',
    timestamp: '2023',
}
export const counterEventsMocks: [CounterEventsDetails, CounterEventsDetails] = [
    counterCreatedEventMock,
    counterIncrementedEventMock,
]

export const countersReducer = (
    counterAggregate: CounterAggregate,
    event: CounterEventsDetails
): CounterAggregate => {
    const { version, aggregateId } = event

    switch (event.type) {
        case 'COUNTER_CREATED':
            return {
                aggregateId,
                version: event.version,
                count: 0,
                status: 'LIVE',
            }
        case 'COUNTER_INCREMENTED':
            return {
                ...counterAggregate,
                version,
                count: counterAggregate.count + 1,
            }
        case 'COUNTER_DELETED':
            return {
                ...counterAggregate,
                version,
                status: 'DELETED',
            }
        default: {
            return {
                ...counterAggregate,
                version,
            }
        }
    }
}

export const counterEventStore = new EventStore({
    eventStoreId: 'Counters',
    eventStoreEvents: [counterCreatedEvent, counterIncrementedEvent, counterDeletedEvent],
    reduce: countersReducer,
    storageAdapter: mockStorageAdapter,
})
