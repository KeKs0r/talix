import type { StorageAdapter } from '@castore/core'
import type { DurableObjectState, Request } from '@cloudflare/workers-types'
import { createDocumentCommand, getDocumentEventStore } from 'domain-core'
import type { Command, EventStore } from 'castore-extended'
import Emittery from 'emittery'

import type { Bindings } from '../env.types'
import type { ProduceBody } from '../queue/handler'

import { DurableStorageAdapter } from './durable-storage-adapter'

abstract class BaseEntity {
    state: DurableObjectState
    env: Bindings
    adapter: StorageAdapter
    store: EventStore
    eventQueue: Queue
    abstract getStore(deps: { storageAdapter: StorageAdapter; emitter: Emittery }): EventStore
    abstract commands: Command[]
    constructor(state: DurableObjectState, env: Bindings) {
        console.log('object.state.id', state.id)
        debugger
        this.state = state
        this.env = env
        this.adapter = new DurableStorageAdapter(state)
        const emitter = new Emittery()
        this.store = this.getStore({ storageAdapter: this.adapter, emitter })
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
        const commandName = url.searchParams.get('command')
        if (!commandName) {
            return new Response('Command not provided', { status: 400 })
        }

        switch (commandName) {
            case 'getAggregate':
                return new Response(JSON.stringify(await this.getAggregate()))
            case 'getExistingAggregate':
                return new Response(JSON.stringify(await this.getExistingAggregate()))
        }

        const commandsById = Object.fromEntries(this.commands.map((c) => [c.commandId, c]))

        const command = commandName && commandsById[commandName]
        if (command) {
            const payload = await request.json()
            console.log(command.commandId, payload)
            const result = await command.handler(payload as any, [this.store as any])
            return new Response(JSON.stringify(result))
        }
        return new Response(`Command not found: ${command}`, { status: 404 })
    }
    async getAggregate() {
        return this.store.getAggregate('FAKE_ID')
    }
    async getExistingAggregate() {
        return this.store.getExistingAggregate('FAKE_ID')
    }
}

export class DocumentEntity extends BaseEntity {
    getStore = getDocumentEventStore
    commands = [createDocumentCommand]
}
