import { R2Bucket, Queue, D1Database } from '@cloudflare/workers-types'

export interface Bindings {
    // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
    SESSION_STORAGE: KVNamespace
    //
    // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
    // MY_DURABLE_OBJECT: DurableObjectNamespace;
    DURABLE_ENTITY: DurableObjectNamespace
    //
    // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
    DOCUMENTS_BUCKET: R2Bucket

    EVENT_QUEUE: Queue

    DB: D1Database
    TELEGRAM_BOT_TOKEN: string
}

export interface Env {
    Bindings: Bindings
}
