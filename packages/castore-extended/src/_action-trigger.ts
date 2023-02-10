/**
 * This is just a draft for interfaces. Can be ignored for now
 */
import { EventType } from '@castore/core'

type HTTPMethod = 'POST' | 'GET' | 'PUT' | 'DELETE'

export type Trigger = HTTPTrigger | EventTrigger<EventType>

export class HTTPTrigger<Path extends string = string, Method extends HTTPMethod = 'POST'> {
    readonly path: Path
    readonly method: Method
    constructor(path: Path, method?: Method) {
        this.path = path
        this.method = method || ('POST' as Method)
    }
    static on(path: string, method: HTTPMethod = 'POST') {
        return new HTTPTrigger(path, method)
    }
}

export class EventTrigger<Type extends EventType = EventType> {
    readonly eventType: Type
    constructor(eventType: Type) {
        this.eventType = eventType
    }
    static on<Type extends EventType>(eventType: Type) {
        return new EventTrigger(eventType)
    }
}
