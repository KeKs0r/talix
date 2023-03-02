import { EventTypeDetail } from '@castore/core'
import { Command, EventDetail, warning, ZodEventType } from '@chute/core'
import { z } from 'zod'

import {
    TransactionSchema,
    TransactionAggregate,
    TransactionData,
    createHash,
} from './transaction-aggregate'
import { TransactionEventStore } from './transaction-store'

const syncTransactionInputSchema = TransactionSchema.omit({ createdAt: true, updatedAt: true })
type SyncTransactionInput = z.infer<typeof syncTransactionInputSchema>

export const syncTransactionCommand = new Command({
    commandId: 'bank:sync-transaction',
    async handler(
        input: SyncTransactionInput,
        { transactionStore }: { transactionStore: TransactionEventStore }
    ) {
        const parsed = syncTransactionInputSchema.parse(input)

        const id = await createHash(parsed)
        const { lastEvent, aggregate } = await transactionStore.getAggregate(id)
        if (lastEvent || aggregate) {
            return warning({
                code: 'TransactionAlreadySynced',
                message: 'Transaction was already synced',
            })
        }
    },
})

export const syncTransactionEventType = new ZodEventType({
    type: 'bank:transaction_synced',
    payloadSchema: syncTransactionInputSchema,
})
export type SyncTransactionEventTypeDetails = EventTypeDetail<typeof syncTransactionEventType>
