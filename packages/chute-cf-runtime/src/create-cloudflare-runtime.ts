import { asFunction } from 'awilix'
import { Chute } from '@chute/core'
import { ulidFactory } from 'ulid-workers'
import { R2FileStorage } from 'file-storage'

import { createHTTPActions } from './http'
import { createQueue } from './queue'
import { CfStorageAdapter } from './cf-storage-adapter'
import { CFRuntimeContext } from './runtime-context'

/**
 * Cloudflare Runtime wraps all the with the necessary runtime
 */
export function createCloudflareRuntime<C extends CFRuntimeContext = CFRuntimeContext>(
    app: Chute<C>
) {
    app.container.register(
        'generateId',
        asFunction(() => ulidFactory())
    )
    app.container.register(
        'storageAdapter',
        asFunction(({ DURABLE_ENTITY }) => new CfStorageAdapter(DURABLE_ENTITY))
    )
    app.container.register(
        'fileStorage',
        asFunction(({ DOCUMENTS_BUCKET }) => new R2FileStorage(DOCUMENTS_BUCKET))
    )

    const hono = createHTTPActions(app)
    const queue = createQueue(app)
    return {
        hono,
        fetch: hono.fetch,
        queue,
    }
}
