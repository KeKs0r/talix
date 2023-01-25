import z from 'zod'
import { Command, tuple } from '@castore/core'

import { documentEventStore } from '../document'

import { receiptEventStore } from './receipt-eventstore'
import { ReceiptCreatedEventTypeDetail, receiptCreatedEventType } from './receipt-created-event'

const createReceiptCommandInputSchema = z.object({
    documentId: z.string(),
})
export type CreateReceiptInput = z.infer<typeof createReceiptCommandInputSchema>
type Output = { receiptId: string }
type Context = { generateId: () => string }

export const createReceiptCommand = new Command({
    commandId: 'RECEIPTS:CREATE_RECEIPT',
    requiredEventStores: tuple(receiptEventStore, documentEventStore),
    handler: async (
        commandInput: CreateReceiptInput,
        [receiptEventStore, documentEventStore],
        { generateId }: Context
    ): Promise<Output> => {
        const { documentId } = createReceiptCommandInputSchema.parse(commandInput)

        // Just to check that the document exists
        await documentEventStore.getExistingAggregate(documentId)

        const receiptId = generateId()

        const event: ReceiptCreatedEventTypeDetail = {
            aggregateId: receiptId,
            version: 1,
            type: receiptCreatedEventType.type,
            payload: receiptCreatedEventType.payloadSchema.parse({ documentId }),
        }

        await receiptEventStore.pushEvent(event)

        return { receiptId }
    },
})
