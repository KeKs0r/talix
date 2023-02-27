import { Chute } from '@chute/core'
import { ExecutionContext } from '@cloudflare/workers-types'
import { AwilixContainer, asValue, asFunction } from 'awilix'
import { diary } from 'diary'
import Emittery from 'emittery'

import { Bindings } from './base-env.types'
import { ProduceBody } from './queue'
import { CFRuntimeContext, RuntimeContext } from './runtime-context'

const logger = diary('cf:runtime:scope')

export function createScope<C extends CFRuntimeContext = CFRuntimeContext>(
    app: Chute<C>,
    env: Bindings,
    execCtx: ExecutionContext
) {
    const scope = app.container.createScope<C>()
    const emitter = new Emittery()
    scope.register('emitter', asValue(emitter))

    const entries = Object.entries(env)
    entries.forEach(([key, value]) => {
        scope.register(key, asValue(value))
    })

    logger.info('Registering Scope', Object.keys(env).join(','))

    scope.register('execCtx', asValue(execCtx))

    createStorePublisher(scope)

    return scope
}

/**
 * @TODO
 * This publishes every event, even if it does not have consumers
 * It is then swallowed in the fanout. This is a bit wasteful, but fine for now.
 */
export function createStorePublisher<C extends CFRuntimeContext = CFRuntimeContext>(
    scope: AwilixContainer<C>
) {
    const eventQueue = scope.resolve('EVENT_QUEUE')
    const execCtx = scope.resolve('execCtx')

    const emitter = scope.resolve('emitter')
    emitter.onAny((eventName, event) => {
        const message: ProduceBody = {
            type: 'PRODUCE',
            event,
        }
        execCtx.waitUntil(eventQueue.send(message))
    })
}
