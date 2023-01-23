import type { Reducer } from '@castore/core'

import { DocumentAggregate } from './document-aggregate'
import { DocumentCreatedEventTypeDetail } from './document-created-event'

type DocumentEventDetails = DocumentCreatedEventTypeDetail

export const documentReducer: Reducer<DocumentAggregate, DocumentEventDetails> = (
    documentAggregate,
    newEvent: DocumentEventDetails
) => {
    const { aggregateId, version, timestamp } = newEvent

    switch (newEvent.type) {
        case 'DOCUMENTS:DOCUMENT_CREATED': {
            const { name, url } = newEvent.payload

            return {
                aggregateId,
                version,
                name,
                url,
                createdAt: timestamp,
                status: 'CREATED',
            }
        }

        default:
            return documentAggregate
    }
}