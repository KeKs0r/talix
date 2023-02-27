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
            logger.info(
                'Registering HTTP action',
                action.actionId,
                'on',
                action.httpPath,
                action.httpMethod
            )
            switch (action.httpMethod) {
                case 'GET':
                    return hono.get(action.httpPath, wrapHTTPAction(action, chute))
                case 'PATCH':
                    return hono.patch(action.httpPath, wrapHTTPAction(action, chute))
                case 'PUT':
                    return hono.put(action.httpPath, wrapHTTPAction(action, chute))
                case 'DELETE':
                    return hono.delete(action.httpPath, wrapHTTPAction(action, chute))
                case 'POST':
                    return hono.post(action.httpPath, wrapHTTPAction(action, chute))
                default:
                    throw new Error('Unknown HTTP method: ' + action.httpMethod)
            }
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
        if (action.httpMethod === 'GET') {
            const result = await chute.runAction(action, {}, scope)
            return c.json(result)
        }
        const input = await c.req.json()
        const result = await chute.runAction(action, input, scope)

        c.executionCtx.waitUntil(scope.dispose())

        return c.json(result)
    }
}
