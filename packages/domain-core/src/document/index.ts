import type { StorageAdapter } from '@castore/core'
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter'
import { FileStorage } from 'cf-r2-file-storage'
import { ulid } from 'ulid'

import { createDocumentCommand, CreateDocumentInput } from './document-create-command'
import { documentEventStore } from './document-eventstore'
import { createUploadDocumentFromUrlAction } from './upload-document-url-action'

type ServiceOptions = {
    storageAdapter?: StorageAdapter
    generateId: () => string
    fileStorage: FileStorage
}

export function createDocumentService(opts: ServiceOptions) {
    const {
        storageAdapter = new InMemoryStorageAdapter(),
        generateId = ulid,
        fileStorage,
    } = opts || {}
    documentEventStore.storageAdapter = storageAdapter

    const createDocument = (cmd: CreateDocumentInput) =>
        createDocumentCommand.handler(cmd, [documentEventStore], { generateId })

    const uploadDocumentUrlAction = createUploadDocumentFromUrlAction({
        createDocument,
        fileStorage,
        generateId,
    })

    return {
        createDocument,
        uploadDocumentUrlAction,
    }
}

export type DocumentService = ReturnType<typeof createDocumentService>

export { documentEventStore }
