import z from 'zod'
import { Command } from '@chute/core'

import { DocumentEventStore } from '../document/document-eventstore'

import { VoucherEventStore } from './voucher-eventstore'
import {
    voucherCreatedEventType,
    VoucherCreatedEventTypeDetail,
    VoucherCreatedPayload,
    voucherCreatedPayloadSchema,
} from './voucher-created-event'

const createVoucherCommandInputSchema = voucherCreatedPayloadSchema.pick({
    creditOrDebit: true,
    documentId: true,
    vatTaxType: true,
    voucherDate: true,
})
export type CreateVoucherInput = z.infer<typeof createVoucherCommandInputSchema>
type Output = { voucherId: string }
type Context = {
    generateId: () => string
    voucherEventStore: VoucherEventStore
    documentEventStore: DocumentEventStore
}

export const createVoucherCommand = new Command({
    commandId: 'voucher:cmd:create',
    handler: async (
        commandInput: CreateVoucherInput,
        { generateId, voucherEventStore, documentEventStore }: Context
    ): Promise<Output> => {
        const { documentId, creditOrDebit, vatTaxType, voucherDate } =
            createVoucherCommandInputSchema.parse(commandInput)

        // Just to check that the document exists
        await documentEventStore.getExistingAggregate(documentId)

        const voucherId = generateId()
        const payload: VoucherCreatedPayload = {
            documentId,
            creditOrDebit,
            vatTaxType,
            voucherDate,
        }

        const event: VoucherCreatedEventTypeDetail = {
            aggregateId: voucherId,
            version: 1,
            type: voucherCreatedEventType.type,
            payload,
        }

        await voucherEventStore.pushEvent(event)

        return { voucherId }
    },
})
export type CreateVoucherCommand = typeof createVoucherCommand
