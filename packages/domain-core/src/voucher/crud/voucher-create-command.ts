import z from 'zod'
import { Command } from '@chute/core'

import { DocumentEventStore } from '../../document/document-eventstore'
import { VoucherEventStore } from '../voucher-eventstore'

import {
    voucherCreatedEventType,
    VoucherCreatedPayload,
    voucherCreatedPayloadSchema,
} from './voucher-created-event'

const createVoucherCommandInputSchema = voucherCreatedPayloadSchema.pick({
    creditOrDebit: true,
    documentId: true,
    documentHash: true,
    vatTaxType: true,
    voucherDate: true,
})
export type CreateVoucherInput = z.infer<typeof createVoucherCommandInputSchema>
type Output = { voucherId: string }
type Context = {
    generateId: () => string
    voucherStore: VoucherEventStore
    documentStore: DocumentEventStore
}

export const createVoucherCommand = new Command({
    commandId: 'voucher:cmd:create',
    handler: async (
        commandInput: CreateVoucherInput,
        { generateId, voucherStore, documentStore }: Context
    ): Promise<Output> => {
        const { documentId, creditOrDebit, vatTaxType, voucherDate, documentHash } =
            createVoucherCommandInputSchema.parse(commandInput)

        // Just to check that the document exists
        await documentStore.getExistingAggregate(documentId)

        const voucherId = generateId()
        const payload: VoucherCreatedPayload = {
            documentId,
            creditOrDebit,
            vatTaxType,
            voucherDate,
            documentHash,
        }

        const event = voucherCreatedEventType.create(
            {
                aggregateId: voucherId,
                version: 1,
            },
            payload
        )

        await voucherStore.pushEvent(event)

        return { voucherId }
    },
})
export type CreateVoucherCommand = typeof createVoucherCommand
