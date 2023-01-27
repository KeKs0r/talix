import { StorageAdapter, EventDetail, EventTypesDetails } from '@castore/core'
import { EventStore } from 'castore-extended'

import { emitter } from '../shared/emitter'

import { documentCreatedEventType } from './document-created-event'
import { documentReducer } from './document-reducer'

type DocumentEventTypes = [typeof documentCreatedEventType]
type DocumentEventDetails = EventTypesDetails<DocumentEventTypes>
export class DocumentEventStore extends EventStore<
    'DOCUMENTS',
    DocumentEventTypes,
    DocumentEventDetails,
    typeof documentReducer
> {
    constructor(storageAdapter?: StorageAdapter) {
        super({
            eventStoreId: 'DOCUMENTS',
            eventStoreEvents: [documentCreatedEventType],
            reduce: documentReducer,
            emitter,
            storageAdapter,
        })
    }
}

export const documentEventStore = new EventStore({
    eventStoreId: 'DOCUMENTS',
    eventStoreEvents: [documentCreatedEventType],
    reduce: documentReducer,
    emitter,
})
