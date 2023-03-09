import z from 'zod'
import { ZodEventType } from '@castore/zod-event'
import { EventDetail, EventTypeDetail } from '@castore/core'

export const voucherDuplicateFoundPayloadSchema = z.object({
    duplicateVoucherId: z.string(),
    didRunOnThis: z.boolean(),
})
export type VoucherDuplicateFoundPayload = z.infer<typeof voucherDuplicateFoundPayloadSchema>

export const voucherDuplicateFoundEventType = new ZodEventType<
    'voucher:duplicate_found',
    typeof voucherDuplicateFoundPayloadSchema
>({
    type: 'voucher:duplicate_found',
    payloadSchema: voucherDuplicateFoundPayloadSchema,
})
export type VoucherDuplicateFoundEventDetail = EventDetail<
    typeof voucherDuplicateFoundPayloadSchema
>
export type VoucherDuplicateFoundTypeDetail = EventTypeDetail<typeof voucherDuplicateFoundEventType>
