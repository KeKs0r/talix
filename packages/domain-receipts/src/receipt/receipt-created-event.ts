import z from 'zod'
import { ZodEventType } from '@castore/zod-event'
import { EventTypeDetail } from '@castore/core'

const receiptCreatedPayloadSchema = z.object({
    documentId: z.string(),
})

export const receiptCreatedEventType = new ZodEventType({
    type: 'RECEIPT:RECEIPT_CREATED',
    payloadSchema: receiptCreatedPayloadSchema,
})

export type ReceiptCreatedEventTypeDetail = EventTypeDetail<typeof receiptCreatedEventType>
