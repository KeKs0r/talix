import { StorageAdapter } from '@castore/core'
import { EventStore } from 'castore-extended'
import Emittery from 'emittery'

import { emitter } from '../shared/emitter'

import { documentCreatedEventType } from './document-created-event'
import { documentReducer } from './document-reducer'

export function getDocumentEventStore({
    storageAdapter,
    emitter,
}: {
    storageAdapter?: StorageAdapter
    emitter: Emittery
}) {
    return new EventStore({
        eventStoreId: 'DOCUMENTS',
        eventStoreEvents: [documentCreatedEventType],
        reduce: documentReducer,
        emitter,
        storageAdapter,
    })
}

export const documentEventStore = getDocumentEventStore({ emitter })
