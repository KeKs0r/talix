import type { RuntimeContext } from '@chute/cf-runtime'
import { EventStore } from '@chute/core'

import { documentCreatedEventType } from './document-created-event'
import { documentReducer } from './document-reducer'

export const createDocumentEventStore = ({ emitter, storageAdapter }: RuntimeContext) => {
    return new EventStore({
        eventStoreId: 'documentEventStore',
        eventStoreEvents: [documentCreatedEventType],
        reduce: documentReducer,
        emitter,
        storageAdapter,
    })
}

export type DocumentEventStore = ReturnType<typeof createDocumentEventStore>
