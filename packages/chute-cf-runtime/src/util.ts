import { AwilixContainer, asValue } from 'awilix'
import type { Context } from 'hono'

import { Bindings, Env } from './base-env.types'
import { RuntimeContext } from './runtime-context'

type HTTPRuntimeScope = Bindings & RuntimeContext & { req: Context<Env>['req'] }

export function createHTTPScope(
    container: AwilixContainer<RuntimeContext>,
    ctx: Context<Env>
): AwilixContainer<HTTPRuntimeScope> {
    const scope = createScope(container, ctx.env)
    const httpScope = scope.register('req', asValue(ctx.req))
    // I know this is nasty, but imperative APIs are hard to type. Want to expose the correct type
    return httpScope as unknown as AwilixContainer<HTTPRuntimeScope>
}

export function createScope(container: AwilixContainer<RuntimeContext>, env: Bindings) {
    const entries = Object.entries(env)
    const envContext = Object.fromEntries(entries.map(([key, value]) => [key, asValue(value)]))
    return container.createScope<Bindings>().register(envContext)
}
