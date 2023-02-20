import ok from 'tiny-invariant'
import { createContainer, AwilixContainer, asValue } from 'awilix'
import { EventType } from '@castore/core'
import { diary } from 'diary'

import { Action, GetActionInput } from './action'
import { Command, GetCommandInput } from './command'
import { EventStore } from './event-store'
import { isEventAction } from './event-action'
import type { BaseContext } from './base-context'

const logger = diary('chute:app')

export class Chute<C extends BaseContext = BaseContext> {
    // plugins: Array<Plugin> = []
    aggregates: Record<string, Aggregate> = {}
    actions: Record<string, Action> = {}
    container: AwilixContainer<C>
    constructor() {
        this.container = createContainer()
        this.container.register('runCommand', asValue(this.runCommand.bind(this)))
        this.container.register('runAction', asValue(this.runAction.bind(this)))
    }

    registerPlugin(plugin: Plugin<C>) {
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
    build() {
        // console.log('chute.build', this.container.resolve('runCommand'))
        return this
    }

    registerAggregate(aggregate: Aggregate) {
        ok(!this.aggregates[aggregate.name], `Aggregate '${aggregate.name}' is already registered`)
        this.aggregates[aggregate.name] = aggregate

        const container = this.container
        // aggregate.commands?.forEach((command) => {
        //     container.register(command.commandId, asValue(command))
        // })
        container.register(aggregate.store.eventStoreId, asValue(aggregate.store))

        // aggregate.events?.forEach((event) => {
        //     container.register(event.type, asValue(event))
        // })
        return this
    }

    registerAction(action: Action) {
        ok(!this.actions[action.actionId], `Action '${action.actionId}' is already registered`)
        this.actions[action.actionId] = action
        return this
    }

    protected getChildScope(parentScope: AwilixContainer<BaseContext>, parent: Action | Command) {
        const child = parentScope.createScope()
        child.register('parent', asValue(parent))

        const runChildAction = <A extends Action>(action: A, input: GetActionInput<A>) => {
            return this.runAction(action, input, child)
        }
        const runChildCommand = <C extends Command>(command: C, input: GetCommandInput<C>) => {
            return this.runCommand(command, input, child)
        }
        child.register('runAction', asValue(runChildAction))
        child.register('runCommand', asValue(runChildCommand))
        return child
    }

    async runAction<A extends Action>(
        action: A,
        input: GetActionInput<A>,
        parentScope?: AwilixContainer<BaseContext>
    ) {
        const scope = this.getChildScope(parentScope || this.container, action)
        const parentName =
            parentScope?.hasRegistration('parent') && getParentId(parentScope.resolve('parent'))
        logger.info('runAction', parentName, '->', action.actionId)
        logger.info('runAction', (scope.cradle as any)['DOCUMENTS_BUCKET'])
        const result = await action.handler(input, scope.cradle)
        return result
    }

    async runCommand<C extends Command>(
        command: C,
        input: GetCommandInput<C>,
        parentScope?: AwilixContainer<BaseContext>
    ) {
        const scope = this.getChildScope(parentScope || this.container, command)

        const parentName =
            parentScope?.hasRegistration('parent') && getParentId(parentScope.resolve('parent'))
        logger.info('runCommand', parentName, '->', command.commandId)
        // @TODO: no idea how to make the cradle type safe
        const result = await command.handler(input, scope.cradle)
        return result
    }

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

type Plugin<C extends BaseContext = BaseContext> = (chute: Chute<C>) => void

function getParentId(parent?: Command | Action) {
    if (parent instanceof Command) {
        return parent.commandId
    } else if (parent instanceof Action) {
        return parent.actionId
    }
}
