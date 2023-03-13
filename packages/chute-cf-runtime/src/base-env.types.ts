import { R2Bucket, Queue, DurableObjectNamespace } from '@cloudflare/workers-types'

export type Bindings = {
    SESSION_STORAGE: KVNamespace
    DURABLE_ENTITY: DurableObjectNamespace
    DOCUMENTS_BUCKET: R2Bucket
    EVENT_QUEUE: Queue
    DB: D1Database
}

export type Env = {
    Bindings: Bindings
}
