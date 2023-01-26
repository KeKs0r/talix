import z from 'zod'
import { ZodEventType } from '@castore/zod-event'
import { EventTypeDetail } from '@castore/core'

const voucherCreatedPayloadSchema = z.object({
    documentId: z.string(),
})

export const voucherCreatedEventType = new ZodEventType({
    type: 'VOUCHER:VOUCHER_CREATED',
    payloadSchema: voucherCreatedPayloadSchema,
})

export type VoucherCreatedEventTypeDetail = EventTypeDetail<typeof voucherCreatedEventType>
