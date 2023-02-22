import { diary } from 'diary'
import { HttpAction, isHttpAction, Chute } from '@chute/core'
import { Handler, Hono } from 'hono'

import { Env } from './base-env.types'
import { createScope } from './scope'
import { CFRuntimeContext } from './runtime-context'

const logger = diary('cf:runtime:http')

export function createHTTPActions<C extends CFRuntimeContext = CFRuntimeContext>(chute: Chute<C>) {
    const hono = new Hono<Env>()
    Object.values(chute.actions).forEach((action) => {
        if (isHttpAction(action)) {
            logger.info('Registering HTTP action', action.actionId, 'on', action.httpPath)
            hono.post(action.httpPath, wrapHTTPAction(action, chute))
        }
    })
    return hono
}

function wrapHTTPAction<C extends CFRuntimeContext = CFRuntimeContext>(
    action: HttpAction,
    chute: Chute<C>
): Handler<Env> {
    return async (c) => {
        const scope = createScope(chute, c.env, c.executionCtx)

        const input = await c.req.json()
        const result = await chute.runAction(action, input, scope)
        return c.json(result)
    }
}
