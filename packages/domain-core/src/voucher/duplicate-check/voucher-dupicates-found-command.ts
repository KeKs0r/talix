import z from 'zod'
import { Command } from '@chute/core'

import { VoucherEventStore } from '../voucher-eventstore'

import {
    voucherDuplicateFoundEventType,
    VoucherDuplicateFoundPayload,
    VoucherDuplicateFoundEventDetail,
} from './voucher-duplicate-found-event'

const voucherDuplicatesFoundPayloadSchema = z.object({
    voucherId: z.string(),
    duplicateVoucherIds: z.array(z.string()),
    didRunOnThis: z.boolean(),
})
export type VoucherDuplicatesFoundInput = z.infer<typeof voucherDuplicatesFoundPayloadSchema>

export const createVoucherCommand = new Command({
    commandId: 'voucher:cmd:duplicates_found',
    handler: async (
        commandInput: VoucherDuplicatesFoundInput,
        { voucherStore }: { voucherStore: VoucherEventStore }
    ) => {
        const { didRunOnThis, duplicateVoucherIds, voucherId } =
            voucherDuplicatesFoundPayloadSchema.parse(commandInput)

        // Just to check that the document exists
        const { lastEvent } = await voucherStore.getExistingAggregate(voucherId)

        const nextVersion = lastEvent.version + 1

        await Promise.all(
            duplicateVoucherIds.map((duplicateId, idx) => {
                const payload: VoucherDuplicateFoundPayload = {
                    didRunOnThis,
                    duplicateVoucherId: duplicateId,
                }
                const event: VoucherDuplicateFoundEventDetail = {
                    type: voucherDuplicateFoundEventType,
                    aggregateId: voucherId,
                    version: nextVersion + 1,
                    payload,
                }
                return voucherStore.pushEvent(event)
            })
        )

        return {
            voucherId,
        }
    },
})
export type CreateVoucherCommand = typeof createVoucherCommand
