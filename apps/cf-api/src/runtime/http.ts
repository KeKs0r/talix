import { diary } from 'diary'
import { HttpAction, isHttpAction, Chute } from '@chute/core'
import { Handler, Hono } from 'hono'

import { Env } from '../env.types'

import { createHTTPScope } from './util'

const logger = diary('cf:runtime:http')

export function createHTTPActions(chute: Chute) {
    const hono = new Hono<Env>()
    Object.values(chute.actions).forEach((action) => {
        if (isHttpAction(action)) {
            logger.info('Registering HTTP action', action.actionId, 'on', action.httpPath)
            hono.post(action.httpPath, wrapHTTPAction(action, chute))
        }
    })
    return hono
}

function wrapHTTPAction(action: HttpAction, chute: Chute): Handler<string, Env> {
    return async (c) => {
        const scope = createHTTPScope(chute.container, c)
        const input = await c.req.json()
        const result = await action.handler(input, scope.cradle)
        return c.json(result)
    }
}
