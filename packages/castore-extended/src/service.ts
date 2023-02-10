import { EventType } from '@castore/core'

import { EventStore } from './event-store'
import { EventAction } from './event-action'
import { Command } from './command'
import { Action } from './action'

/**
 * currently the scope of a single service is one aggregate. Maybe we will split the concerns,
 * so a single service could contain multiple aggregates
 */
export interface Service {
    name: string
    store: EventStore
    commands?: Array<Command>
    events?: Array<EventType>
    /**
     * Actions are not directly bound to an aggregate root. But lets keep a single
     * interface for now
     */
    actions?: Array<EventAction | Action>
}
