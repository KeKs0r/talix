import { R2Bucket, Queue, DurableObjectNamespace } from '@cloudflare/workers-types'

export type Bindings = {
    DURABLE_ENTITY: DurableObjectNamespace
    DOCUMENTS_BUCKET: R2Bucket
    EVENT_QUEUE: Queue
}

export type Env = {
    Bindings: Bindings
}
