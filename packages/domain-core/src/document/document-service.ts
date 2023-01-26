import type { StorageAdapter } from '@castore/core'
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter'
import { Service } from 'castore-extended'
import type { FileStorage } from 'file-storage'
import { ulid } from 'ulid'

import { createDocumentCommand } from './document-create-command'
import { documentEventStore } from './document-eventstore'
import { uploadDocumentFromUrlAction } from './upload-document-url-action'

type ServiceDeps = {
    storageAdapter?: StorageAdapter
    generateId: () => string
    fileStorage: FileStorage
}

export function createDocumentService(opts: ServiceDeps) {
    const {
        storageAdapter = new InMemoryStorageAdapter(),
        generateId = ulid,
        fileStorage,
    } = opts || {}
    documentEventStore.storageAdapter = storageAdapter

    const createDocument = createDocumentCommand.register([documentEventStore], { generateId })

    uploadDocumentFromUrlAction.register({
        createDocument: createDocument.run,
        fileStorage,
        generateId,
    })
    const service = {
        name: 'document',
        commands: {
            createDocument,
        },
        actions: {
            uploadDocumentFromUrlAction,
        },
        stores: {
            [documentEventStore.eventStoreId]: documentEventStore,
        },
    } satisfies Service
    return service
}

export type DocumentService = ReturnType<typeof createDocumentService>
