import Emittery from 'emittery'
import type {
    $Contravariant,
    Aggregate,
    EventDetail,
    EventType,
    EventTypesDetails,
    Reducer,
    StorageAdapter,
} from '@castore/core'
import { EventStore as BaseEventStore } from '@castore/core'
import { EventPusher } from '@castore/core/dist/types/eventStore'

export class EventStore<
    I extends string = string,
    E extends EventType[] = EventType[],
    D extends EventDetail = EventTypesDetails<E>,
    // cf https://devblogs.microsoft.com/typescript/announcing-typescript-4-7-rc/#optional-variance-annotations-for-type-parameters
    // EventStore is contravariant on its fns args: We have to type them as "any" so that EventStore implementations still extends the EventStore type
    $D extends EventDetail = $Contravariant<D, EventDetail>,
    R extends Reducer<Aggregate, $D> = Reducer<Aggregate, $D>,
    A extends Aggregate = ReturnType<R>,
    $A extends Aggregate = $Contravariant<A, Aggregate>
> extends BaseEventStore<I, E, D, $D, R, A, $A> {
    emitter: Emittery
    constructor(args: {
        eventStoreId: I
        /**
         * @debt v2 "rename as eventTypes"
         */
        eventStoreEvents: E
        /**
         * @debt v2 "rename as reducer"
         */
        reduce: R
        simulateSideEffect?: SideEffectsSimulator<D, $D>
        storageAdapter?: StorageAdapter
    }) {
        super(args)
        this.emitter = new Emittery()

        const originalPushEvent: EventPusher<$D> = this.pushEvent
        this.pushEvent = async (event: $D) => {
            await originalPushEvent(event)
            await this.emit(event)
        }
    }

    on<EventType extends E[number]>(
        eventName: EventType['type'],
        listener: (event: EventDetail<EventType>) => Promise<void>
    ) {
        this.emitter.on(eventName, listener)
        return () => this.emitter.off(eventName, listener)
    }

    emit<EventType extends E[number]>(event: EventDetail<EventType>) {
        return this.emitter.emit(event.type, event)
    }
}

/**
 * @dept: Export from @castore/core
 */
type SideEffectsSimulator<
    D extends EventDetail,
    $D extends EventDetail = $Contravariant<D, EventDetail>
> = (
    indexedEvents: Record<string, Omit<$D, 'version'>>,
    event: $D
) => Record<string, Omit<D, 'version'>>
