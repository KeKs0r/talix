import { HttpAction, isHttpAction, Chute } from '@chute/core'
import { Handler, Hono } from 'hono'

import { Env } from '../env.types'

import { bindServices, makeDependencies } from './util'

export function createHTTPActions(chute: Chute) {
    const hono = new Hono<Env>()

    Object.values(chute.actions).forEach((action) => {
        if (isHttpAction(action)) {
            // hono.post(action.httpPath, wrapHTTPAction(action, services))
        }
    })
    return hono
}

// function wrapHTTPAction(action: HttpAction, services: Service[]): Handler<string, Env> {
//     return async (c) => {
//         bindServices(services, c.env)
//         const input = await c.req.json()
//         const result = await action.handler(input, makeDependencies(c.env))
//         c.json(result)
//     }
// }
