import ok from 'tiny-invariant'
import { createContainer, AwilixContainer, asValue, asFunction } from 'awilix'
import { EventType } from '@castore/core'
import { diary } from 'diary'

import { Action, GetActionInput } from './action'
import { Command, GetCommandInput } from './command'
import { EventStore } from './event-store'
import type { BaseContext } from './base-context'
import { Registry, BaseRegistryMap } from './registry'

const logger = diary('chute:app')

export class Chute<
    C extends BaseContext = BaseContext,
    R extends BaseRegistryMap<C> = BaseRegistryMap<C>
> {
    // plugins: Array<Plugin> = []
    registry: Registry<C, R> = new Registry<C, R>()
    container: AwilixContainer<C>
    constructor() {
        this.container = createContainer()
        this.container.register('runCommand', asValue(this.runCommand.bind(this)))
        this.container.register('runAction', asValue(this.runAction.bind(this)))
    }

    registerPlugin<C2 extends C = C, R2 extends R = R>(
        plugin: Plugin<C, R, C2, R2>
    ): Chute<C2, R2> {
        return plugin(this)
        // this.plugins.push(plugin)
    }

    /**
     * @TODO:
     * This is to split the registration of things + wiring up (plugins)
     * Otherwise we cant register everything and then run things.
     * This will be necessary for 2 step plugin initialization
     * ?? why did I think I need 2 step plugin init?
     * -> for plugins to register stuff and then other plugins can collect the outcome (telegram plugin)
     */
    build() {
        // console.log('chute.build', this.container.resolve('runCommand'))
        return this
    }

    registerOfType = this.registry.register.bind(this.registry)
    getOfType = this.registry.get.bind(this.registry)

    /** This is a noop, that just helps with fluent api & type safety */
    registerType<Service, Type extends string = string>(
        type: Type
    ): Chute<C, R & Record<Type, Service>> {
        return this as Chute<C, R & Record<Type, Service>>
    }

    registerAggregate(aggregate: AggregateService<C>) {
        ok(
            !this.container.hasRegistration(aggregate.name),
            `Aggregate '${aggregate.name}' is already registered`
        )
        logger.debug('registerAggregate', aggregate.name)

        const container = this.container
        this.registerOfType('aggregate', aggregate)
        container.register(aggregate.name, asValue(aggregate))

        // aggregate.commands?.forEach((command) => {
        //     container.register(command.commandId, asValue(command))
        // })
        const storeName = `${aggregate.name}Store`
        container.register(
            storeName,
            asFunction((deps) => {
                const store = aggregate.storeFactory(deps)
                ok(
                    storeName === store.eventStoreId,
                    `${store.eventStoreId} does not match the aggregate: ${storeName}`
                )
                return store
            })
        )

        aggregate.events?.forEach((event) => {
            // container.register(event.type, asValue(event))
            ok(
                event.type.startsWith(aggregate.name),
                `${event.type} must start with ${aggregate.name}`
            )
        })
        return this
    }

    registerAction(action: Action) {
        ok(
            !this.container.hasRegistration(action.actionId),
            `Action '${action.actionId}' is already registered`
        )
        logger.debug('registerAction', action.actionId)
        this.registerOfType('action', action)
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

        const result = await command.run(input, scope.cradle)
        return result
    }

    get actions(): Array<Action> {
        return this.getOfType('action')
    }

    get aggregates(): Array<AggregateService<C>> {
        return this.getOfType('aggregate')
    }
}

export interface AggregateService<T> {
    name: string
    storeFactory: (deps: T) => EventStore
    commands?: Array<Command>
    events?: Array<EventType>
}

export type Plugin<
    C extends BaseContext = BaseContext,
    R extends BaseRegistryMap<C> = BaseRegistryMap<C>,
    C2 extends C = C,
    R2 extends R = R
> = (chute: Chute<C, R>) => Chute<C2, R2>

function getParentId(parent?: Command | Action) {
    if (parent instanceof Command) {
        return parent.commandId
    } else if (parent instanceof Action) {
        return parent.actionId
    }
}
