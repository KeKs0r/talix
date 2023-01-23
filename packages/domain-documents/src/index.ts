import type { StorageAdapter } from '@castore/core'
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter'
import { ulid } from 'ulid'

import { documentEventStore } from './document/document-eventstore'
import { createDocumentCommand, CreateDocumentInput } from './document/document-create-command'

type ServiceOptions = {
    storageAdapter?: StorageAdapter
    generateId: () => string
}

export function createDocumentService(opts: ServiceOptions = { generateId: ulid }) {
    const { storageAdapter, generateId } = opts || {}
    if (storageAdapter) {
        documentEventStore.storageAdapter = storageAdapter
    } else {
        documentEventStore.storageAdapter = new InMemoryStorageAdapter()
    }

    return {
        createDocument: (cmd: CreateDocumentInput) =>
            createDocumentCommand.handler(cmd, [documentEventStore], { generateId }),
    }
}

export type DocumentService = ReturnType<typeof createDocumentService>

export { documentEventStore }
