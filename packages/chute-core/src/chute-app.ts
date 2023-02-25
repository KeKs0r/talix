import ok from 'tiny-invariant'
import { createContainer, AwilixContainer, asValue } from 'awilix'
import { EventType, StorageAdapter } from '@castore/core'
import { diary } from 'diary'

import { Action, GetActionInput } from './action'
import { Command, GetCommandInput } from './command'
import { EventStore } from './event-store'
import { isEventAction } from './event-action'
import type { BaseContext } from './base-context'

const logger = diary('chute:app')

export class Chute<C extends BaseContext = BaseContext> {
    // plugins: Array<Plugin> = []
    registeredAggregates = new Set<string>()
    registeredActions = new Set<string>()
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
        ok(
            !this.registeredAggregates.has(aggregate.name),
            `Aggregate '${aggregate.name}' is already registered`
        )
        logger.debug('registerAggregate', aggregate.name)
        this.registeredAggregates.add(aggregate.name)
        const container = this.container
        container.register(aggregate.name, asValue(aggregate))

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
        ok(
            !this.registeredActions.has(action.actionId),
            `Action '${action.actionId}' is already registered`
        )
        logger.debug('registerAction', action.actionId)
        this.registeredActions.add(action.actionId)
        this.container.register(action.actionId, asValue(action))
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
        const eventStores = command.requiredEventStores.map(
            (store) => scope.resolve(store.eventStoreId) as EventStore
        )
        eventStores.forEach((store) => {
            const storageAdapter = scope.resolve('storageAdapter') as StorageAdapter
            store.storageAdapter = storageAdapter
        })
        // @TODO: no idea how to make the cradle type safe
        const result = await command.handler(input, eventStores, scope.cradle)
        return result
    }

    get actions(): Array<Action> {
        const actionIds = Array.from(this.registeredActions)
        return actionIds.map((actionId) => this.container.resolve(actionId))
    }

    get aggregates(): Array<Aggregate> {
        const aggregateNames = Array.from(this.registeredAggregates)
        return aggregateNames.map((aggregateName) => this.container.resolve(aggregateName))
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
