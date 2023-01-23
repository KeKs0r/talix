import { EventStore } from '@castore/core'

import { documentCreatedEventType } from './document-created-event'
import { documentReducer } from './document-reducer'

export const documentEventStore = new EventStore({
    eventStoreId: 'DOCUMENTS',
    eventStoreEvents: [documentCreatedEventType],
    reduce: documentReducer,
})
