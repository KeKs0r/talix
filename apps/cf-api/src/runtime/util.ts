import { AwilixContainer, asValue } from 'awilix'

import { Bindings } from '../env.types'

export function createScope(container: AwilixContainer, env: Bindings) {
    const entries = Object.entries(env)
    console.log(entries)
    const envContext = Object.fromEntries(entries.map(([key, value]) => [key, asValue(value)]))
    return container.createScope().register(envContext)
}
