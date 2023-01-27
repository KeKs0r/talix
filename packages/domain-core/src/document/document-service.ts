import type { StorageAdapter } from '@castore/core'
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter'
import type { FileStorage } from 'file-storage'

import { createDocumentCommand } from './document-create-command'
import { documentEventStore } from './document-eventstore'
import { uploadDocumentFromUrlAction } from './upload-document-url-action'

type ServiceDeps = {
    storageAdapter?: StorageAdapter
    fileStorage: FileStorage
}

export function createDocumentService(opts: ServiceDeps) {
    const { storageAdapter = new InMemoryStorageAdapter(), fileStorage } = opts || {}
    documentEventStore.storageAdapter = storageAdapter

    const createDocument = createDocumentCommand.register([documentEventStore])

    uploadDocumentFromUrlAction.register({
        createDocument: createDocument.run,
        fileStorage,
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
    } // satisfies Service // this does not work with wrangler
    return service
}

export type DocumentService = ReturnType<typeof createDocumentService>
