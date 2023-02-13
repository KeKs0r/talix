import {
    Aggregate,
    EventDetail,
    EventType,
    EventTypesDetails,
    Reducer,
    $Contravariant,
} from '@castore/core'
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter'
import Emittery from 'emittery'

import { EventStore } from '../event-store'

export class MockedEventStore<
    I extends string = string,
    E extends EventType[] = EventType[],
    D extends EventDetail = EventTypesDetails<E>,
    $D extends EventDetail = $Contravariant<D, EventDetail>,
    R extends Reducer<Aggregate, $D> = Reducer<Aggregate, $D>,
    A extends Aggregate = ReturnType<R>
> extends EventStore<I, E, D, $D, R, A> {
    initialEvents: D[]
    reset: () => void

    constructor({
        eventStore,
        initialEvents = [],
        emitter,
    }: {
        eventStore: EventStore<I, E, D, $D, R, A>
        initialEvents?: D[]
        emitter?: Emittery
    }) {
        super({
            eventStoreId: eventStore.eventStoreId,
            eventStoreEvents: eventStore.eventStoreEvents,
            reduce: eventStore.reduce,
            simulateSideEffect: eventStore.simulateSideEffect,
            storageAdapter: new InMemoryStorageAdapter({ initialEvents }),
            emitter: emitter || new Emittery(),
        })

        this.initialEvents = initialEvents
        this.reset = () => (this.storageAdapter = new InMemoryStorageAdapter({ initialEvents }))
    }
}
