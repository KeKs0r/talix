import ok from 'tiny-invariant'
import { createContainer, AwilixContainer, asValue } from 'awilix'
import { EventType } from '@castore/core'

import { Action } from './action'
import { Command } from './command'
import { EventStore } from './event-store'
import { isEventAction } from './event-action'

export class Chute {
    // plugins: Array<Plugin> = []
    aggregates: Record<string, Aggregate> = {}
    actions: Record<string, Action> = {}
    container: AwilixContainer
    constructor() {
        this.container = createContainer()
    }

    registerPlugin(plugin: Plugin) {
        plugin(this)
        // this.plugins.push(plugin)
        return this
    }

    /**
     * @TODO:
     * This is to split the registration of things + wiring up (plugins)
     * Otherwise we cant register everything and then run things.
     * This will be necessary for 2 step plugin initialization
     */
    build() {}

    registerAggregate(aggregate: Aggregate) {
        ok(!this.aggregates[aggregate.name], `Aggregate '${aggregate.name}' is already registered`)
        this.aggregates[aggregate.name] = aggregate

        const container = this.container
        aggregate.commands?.forEach((command) => {
            container.register({
                [command.commandId]: asValue(command),
            })
        })
        container.register({
            [aggregate.store.eventStoreId]: asValue(aggregate.store),
        })
        aggregate.events?.forEach((event) => {
            container.register({
                [event.type]: asValue(event),
            })
        })
        return this
    }

    registerAction(action: Action) {
        ok(!this.actions[action.actionId], `Action '${action.actionId}' is already registered`)
        this.actions[action.actionId] = action
        return this
    }

    // dispatch()

    get eventMap() {
        const eventActions = Object.values(this.actions).filter(isEventAction)
        const eventMap = eventActions.reduce((acc: Record<string, string[]>, action) => {
            if (!acc[action.eventTrigger]) {
                acc[action.eventTrigger] = []
            }
            acc[action.eventTrigger].push(action.actionId)
            return acc
        }, {})
        return eventMap
    }
}

export interface Aggregate {
    name: string
    store: EventStore
    commands?: Array<Command>
    events?: Array<EventType>
}

type Plugin = (chute: Chute) => void
