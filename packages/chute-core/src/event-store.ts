import type Emittery from 'emittery'
import type {
    $Contravariant,
    Aggregate,
    EventDetail,
    EventType,
    EventTypesDetails,
    Reducer,
} from '@castore/core'
import { EventStore as BaseEventStore } from '@castore/core'
import { diary } from 'diary'

const logger = diary('chute:event-store')

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
    constructor(
        options: ConstructorParameters<typeof BaseEventStore<I, E, D, $D, R, A, $A>>[0] & {
            emitter: Emittery
        }
    ) {
        super(options)
        this.emitter = options.emitter

        const originalPushEvent = this.pushEvent
        this.pushEvent = async (event: $D) => {
            await originalPushEvent(event)
            await this.emit(event)
        }
        const originalGetEvents = this.getEvents
        this.getEvents = async (...args) => {
            const r = await originalGetEvents(...args)
            logger.info(r)
            return r
        }
    }

    on<EventType extends E[number]>(
        eventName: EventType['type'],
        listener: (event: EventDetail<EventType>) => Promise<void> | void
    ) {
        this.emitter.on(eventName, listener)
        return () => this.emitter.off(eventName, listener)
    }

    emit<EventType extends E[number]>(event: EventDetail<EventType>) {
        return this.emitter.emit(event.type, event)
    }
}
