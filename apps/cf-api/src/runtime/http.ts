import { HttpAction, isHttpAction, Chute } from '@chute/core'
import { Handler, Hono } from 'hono'

import { Env } from '../env.types'

import { createScope } from './util'

export function createHTTPActions(chute: Chute) {
    const hono = new Hono<Env>()
    Object.values(chute.actions).forEach((action) => {
        if (isHttpAction(action)) {
            hono.post(action.httpPath, wrapHTTPAction(action, chute))
        }
    })
    return hono
}

function wrapHTTPAction(action: HttpAction, chute: Chute): Handler<string, Env> {
    return async (c) => {
        const scope = createScope(chute.container, c.env)
        const input = await c.req.json()
        const result = await action.handler(input, scope)
        c.json(result)
    }
}
