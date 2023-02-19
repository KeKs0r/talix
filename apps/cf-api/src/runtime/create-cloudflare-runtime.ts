import { asFunction, asClass } from 'awilix'
import { Chute } from '@chute/core'
import { ulidFactory } from 'ulid-workers'

import { createHTTPActions } from './http'
import { createQueue } from './queue'
import { CfStorageAdapter } from './cf-storage-adapter'

/**
 * Cloudflare Runtime wraps all the with the necessary runtime
 */
export function createCloudflareRuntime(app: Chute) {
    app.container.register({
        generateId: asFunction(ulidFactory),
        storageAdapter: asFunction(({ DURABLE_ENTITY }) => new CfStorageAdapter(DURABLE_ENTITY)),
    })

    const hono = createHTTPActions(app)
    const queue = createQueue(app)
    return {
        hono,
        fetch: hono.fetch,
        queue,
    }
}
