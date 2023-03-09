import type { Reducer } from '@castore/core'

import { DocumentAggregate } from './document-aggregate'
import {
    DocumentCreatedEventTypeDetail,
    documentCreatedEventType,
} from './command/document-created-event'

type DocumentEventDetails = DocumentCreatedEventTypeDetail

export const documentReducer: Reducer<DocumentAggregate, DocumentEventDetails> = (
    documentAggregate,
    newEvent: DocumentEventDetails
) => {
    const { aggregateId, version, timestamp } = newEvent

    switch (newEvent.type) {
        case documentCreatedEventType.type: {
            const { name, key, contentHash } = newEvent.payload
            return {
                aggregateId,
                version,
                name,
                key,
                contentHash,
                createdAt: timestamp,
                status: 'CREATED',
            }
        }

        default:
            return documentAggregate
    }
}
