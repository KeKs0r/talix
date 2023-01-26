import z from 'zod'
import { Command, tuple } from '@castore/core'

import { documentEventStore } from '../document'

import { voucherEventStore } from './voucher-eventstore'
import { VoucherCreatedEventTypeDetail, voucherCreatedEventType } from './voucher-created-event'

const createVoucherCommandInputSchema = z.object({
    documentId: z.string(),
})
export type CreateVoucherInput = z.infer<typeof createVoucherCommandInputSchema>
type Output = { voucherId: string }
type Context = { generateId: () => string }

export const createVoucherCommand = new Command({
    commandId: 'VOUCHERS:CREATE_VOUCHER',
    requiredEventStores: tuple(voucherEventStore, documentEventStore),
    handler: async (
        commandInput: CreateVoucherInput,
        [voucherEventStore, documentEventStore],
        { generateId }: Context
    ): Promise<Output> => {
        const { documentId } = createVoucherCommandInputSchema.parse(commandInput)

        // Just to check that the document exists
        await documentEventStore.getExistingAggregate(documentId)

        const voucherId = generateId()

        const event: VoucherCreatedEventTypeDetail = {
            aggregateId: voucherId,
            version: 1,
            type: voucherCreatedEventType.type,
            payload: voucherCreatedEventType.payloadSchema!.parse({ documentId }),
        }

        await voucherEventStore.pushEvent(event)

        return { voucherId }
    },
})
