import { RuntimeContext } from '@chute/cf-runtime'
import { EventStore } from '@chute/core'

import { syncTransactionEventType } from './sync-transaction'
import { transactionReducer } from './transaction-reducer'

export const createAccountEventStore = ({ emitter, storageAdapter }: RuntimeContext) =>
    new EventStore({
        eventStoreId: 'accountStore',
        eventStoreEvents: [syncTransactionEventType],
        reduce: transactionReducer,
        emitter,
        storageAdapter,
    })
export type TransactionEventStore = ReturnType<typeof createAccountEventStore>
