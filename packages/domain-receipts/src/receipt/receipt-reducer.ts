import type { Reducer } from '@castore/core'

import { ReceiptAggregate } from './receipt-aggregate'
import { ReceiptCreatedEventTypeDetail, receiptCreatedEventType } from './receipt-created-event'

type ReceiptEventDetails = ReceiptCreatedEventTypeDetail

export const receiptReducer: Reducer<ReceiptAggregate, ReceiptEventDetails> = (
    receiptAggregate,
    newEvent: ReceiptEventDetails
) => {
    const { aggregateId, version, timestamp } = newEvent

    switch (newEvent.type) {
        case receiptCreatedEventType.type: {
            const { documentId } = newEvent.payload
            const receipt: ReceiptAggregate = {
                aggregateId,
                version,
                createdAt: timestamp,
                status: 'DRAFT',
                documentId,
                items: [],
            }
            return receipt
        }

        default:
            console.log('default case')
            return receiptAggregate
    }
}
