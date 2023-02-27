import { asClass, asFunction } from 'awilix'
import { Chute } from '@chute/core'
import { ulidFactory } from 'ulid-workers'
import { R2FileStorage } from 'file-storage'
import { Kysely } from 'kysely'
import { D1Dialect } from 'kysely-d1'
import Emittery from 'emittery'
import { $Contravariant } from '@castore/core'

import { createHTTPActions } from './http'
import { createQueue } from './queue'
import { CfStorageAdapter } from './cf-storage-adapter'
import { CFRuntimeContext } from './runtime-context'
import { dbCheckAction } from './actions/db-check'

/**
 * Cloudflare Runtime wraps all the with the necessary runtime
 */
export function createCloudflareRuntime<
    C extends CFRuntimeContext = CFRuntimeContext,
    $C = $Contravariant<C, CFRuntimeContext>
>(app: Chute<C>) {
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
    app.container.register(
        'kysely',
        asFunction(({ DB }) => new Kysely({ dialect: new D1Dialect({ database: DB }) }))
    )
    app.container.register('emitter', asClass(Emittery).scoped())

    app.registerAction(dbCheckAction)

    const hono = createHTTPActions(app)
    const queue = createQueue(app)
    return {
        hono,
        fetch: hono.fetch,
        queue,
    }
}
