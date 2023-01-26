import z from 'zod'
import { ZodEventType } from '@castore/zod-event'
import { EventDetail, EventTypeDetail } from '@castore/core'

import { DateStringSchema } from '../shared/base-schema'

import { vatTaxTypeSchema, creditOrDebitSchema } from './voucher-aggregate'

export const voucherCreatedPayloadSchema = z.object({
    documentId: z.string(),
    vatTaxType: vatTaxTypeSchema.optional(),
    creditOrDebit: creditOrDebitSchema.optional(),
    voucherDate: DateStringSchema.optional(),
})
export type VoucherCreatedPayload = z.infer<typeof voucherCreatedPayloadSchema>

export const voucherCreatedEventType = new ZodEventType<
    'VOUCHER:VOUCHER_CREATED',
    typeof voucherCreatedPayloadSchema,
    VoucherCreatedPayload
>({
    type: 'VOUCHER:VOUCHER_CREATED',
    payloadSchema: voucherCreatedPayloadSchema,
})
export type VoucherCreatedEventDetail = EventDetail<typeof voucherCreatedEventType>
export type VoucherCreatedEventTypeDetail = EventTypeDetail<typeof voucherCreatedEventType>
