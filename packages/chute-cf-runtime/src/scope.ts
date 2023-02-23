import { Chute, EventStore } from '@chute/core'
import { ExecutionContext } from '@cloudflare/workers-types'
import { AwilixContainer, asValue } from 'awilix'

import { Bindings } from './base-env.types'
import { ProduceBody } from './queue'
import { CFRuntimeContext, RuntimeContext } from './runtime-context'

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
    Object.values(app.aggregates).forEach((agg) => {
        const store = app.container.resolve(agg.store.eventStoreId) as EventStore
        store.emitter.onAny((eventName, event) => {
            const message: ProduceBody = {
                type: 'PRODUCE',
                event,
            }
            execCtx.waitUntil(eventQueue.send(message))
        })
    })
}
