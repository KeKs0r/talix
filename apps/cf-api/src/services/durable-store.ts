import type { StorageAdapter } from '@castore/core'
import type { DurableObjectState, DurableObject, Request } from '@cloudflare/workers-types'
import { createDocumentCommand, DocumentEventStore } from 'domain-core'

import type { Bindings } from '../env.types'

import { DurableStorageAdapter } from './durable-storage-adapter'

export class DocumentEntity {
    state: DurableObjectState
    env: Bindings
    adapter: StorageAdapter
    store: DocumentEventStore
    constructor(state: DurableObjectState, env: Bindings) {
        this.state = state
        this.env = env
        this.adapter = new DurableStorageAdapter(state)
        this.store = new DocumentEventStore(this.adapter)
    }
    async fetch(request: Request) {
        const url = new URL(request.url)

        console.log('DocumentEntity.fetch', url.pathname)
        switch (url.pathname) {
            case '/create': {
                const payload = await request.json()
                console.log('/create', payload)
                const result = await createDocumentCommand.handler(payload as any, [
                    this.store as any,
                ])
                console.log('/create result', result)
                return new Response(JSON.stringify(result))
            }
            default: {
                return new Response('Not found', { status: 404 })
            }
        }
    }
}
