import type { StorageAdapter } from '@castore/core'
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter'
import { ulid } from 'ulid'

import { documentEventStore } from './document/document-eventstore'
import { uploadDocumentCommand, UploadDocumentInput } from './document/document-upload-command'

type ServiceOptions = {
    storageAdapter?: StorageAdapter
    generateUuid: () => string
}

export function createDocumentService(opts: ServiceOptions = { generateUuid: ulid }) {
    const { storageAdapter, generateUuid } = opts || {}
    if (storageAdapter) {
        documentEventStore.storageAdapter = storageAdapter
    } else {
        documentEventStore.storageAdapter = new InMemoryStorageAdapter()
    }

    return {
        uploadDocument: (cmd: UploadDocumentInput) =>
            uploadDocumentCommand.handler(cmd, [documentEventStore], { generateUuid }),
    }
}
