import type { StorageAdapter } from '@castore/core'
import type { DurableObjectState, Request } from '@cloudflare/workers-types'
import { createDocumentCommand, getDocumentEventStore } from 'domain-core'
import type { EventStore } from 'castore-extended'
import Emittery from 'emittery'

import type { Bindings } from '../env.types'
import type { ProduceBody } from '../queue/handler'

import { DurableStorageAdapter } from './durable-storage-adapter'

export class DocumentEntity {
    state: DurableObjectState
    env: Bindings
    adapter: StorageAdapter
    store: EventStore
    eventQueue: Queue
    constructor(state: DurableObjectState, env: Bindings) {
        this.state = state
        this.env = env
        this.adapter = new DurableStorageAdapter(state)
        const emitter = new Emittery()
        this.store = getDocumentEventStore({ storageAdapter: this.adapter, emitter })
        this.eventQueue = env.EVENT_QUEUE
        emitter.onAny(async (eventName, event) => {
            const message: ProduceBody = {
                type: 'PRODUCE',
                event,
            }
            await this.eventQueue.send(message)
        })
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
