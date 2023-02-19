import { AwilixContainer, asValue } from 'awilix'
import { Context } from 'hono'

import { Bindings, Env } from '../env.types'

export function createHTTPScope(container: AwilixContainer, ctx: Context<string, Env, any>) {
    return createScope(container, ctx.env).register({ req: asValue(ctx.req) })
}

export function createScope(container: AwilixContainer, env: Bindings) {
    const entries = Object.entries(env)
    const envContext = Object.fromEntries(entries.map(([key, value]) => [key, asValue(value)]))
    return container.createScope().register(envContext)
}
