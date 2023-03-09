import type { Reducer } from '@castore/core'
import { EventTypesDetails } from '@chute/core'

import { TransactionAggregate } from './transaction-aggregate'
import { syncTransactionEventType, SyncTransactionEventTypeDetails } from './sync-transaction'

type TransactionEventDetails = EventTypesDetails<[typeof syncTransactionEventType]>

export const transactionReducer: Reducer<TransactionAggregate, TransactionEventDetails> = (
    transactionAggregate,
    newEvent
) => {
    switch (newEvent.type) {
        case syncTransactionEventType.type: {
            const event: SyncTransactionEventTypeDetails = newEvent
            const transaction: TransactionAggregate = {
                aggregateId: event.aggregateId,
                version: event.version,
                createdAt: event.timestamp,
                ...event.payload,
            }
            return transaction
        }
        default:
            console.warn('voucher-reducer', 'default case')
            return transactionAggregate
    }
}
