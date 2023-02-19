import { AwilixContainer, asValue } from 'awilix'

import { Bindings } from '../env.types'

export function createScope(container: AwilixContainer, env: Bindings) {
    return container.createScope().register({
        DOCUMENTS_BUCKET: asValue(env.DOCUMENTS_BUCKET),
        DURABLE_ENTITY: asValue(env.DURABLE_ENTITY),
        EVENT_QUEUE: asValue(env.EVENT_QUEUE),
    })
}
