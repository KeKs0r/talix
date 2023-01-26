import { EventStore } from 'castore-extended'

import { emitter } from '../shared/emitter'

import { documentCreatedEventType } from './document-created-event'
import { documentReducer } from './document-reducer'

export const documentEventStore = new EventStore({
    eventStoreId: 'DOCUMENTS',
    eventStoreEvents: [documentCreatedEventType],
    reduce: documentReducer,
    emitter,
})
