import { Chute, EventStore } from '@chute/core'
import { ExecutionContext } from '@cloudflare/workers-types'
import { AwilixContainer, asValue } from 'awilix'
import { diary } from 'diary'

import { Bindings } from './base-env.types'
import { ProduceBody } from './queue'
import { CFRuntimeContext, RuntimeContext } from './runtime-context'

const logger = diary('cf:runtime:scope')

export function createScope(
    app: Chute<CFRuntimeContext>,
    env: Bindings,
    execCtx: ExecutionContext
) {
    const scope = app.container.createScope<CFRuntimeContext>()

    const entries = Object.entries(env)
    const envContext = Object.fromEntries(entries.map(([key, value]) => [key, asValue(value)]))
    scope.register(envContext)

    scope.register('execCtx', asValue(execCtx))

    createStorePublisher(app, scope)

    return scope
}

/**
 * @TODO
 * This publishes every event, even if it does not have consumers
 * It is then swallowed in the fanout. This is a bit wasteful, but fine for now.
 */
export function createStorePublisher(
    app: Chute<Bindings & RuntimeContext>,
    scope: AwilixContainer<Bindings & RuntimeContext>
) {
    const eventQueue = scope.resolve('EVENT_QUEUE')
    const execCtx = scope.resolve('execCtx')

    const emitters = Object.values(app.aggregates).map((agg) => {
        const store = app.container.resolve(agg.store.eventStoreId) as EventStore
        return store.emitter
    })

    const uniqueEmitters = Array.from(new Set(emitters))

    /**
     * @TODO: the emitter should be a singleton on the container
     */
    uniqueEmitters.forEach((emitter) => {
        emitter.onAny((eventName, event) => {
            const message: ProduceBody = {
                type: 'PRODUCE',
                event,
            }
            execCtx.waitUntil(eventQueue.send(message))
        })
    })
}
