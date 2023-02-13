import { describe, beforeEach, it, expect } from 'vitest'
import { mockEventStore } from '@chute/core'

import { documentEventStore } from '../../document'
import { voucherEventStore } from '../voucher-eventstore'
import { createVoucherCommand, CreateVoucherInput } from '../voucher-create-command'
import { createDateString } from '../../shared/date.types'

describe.concurrent('Upload Document', () => {
    const mockedVoucherEventStore = mockEventStore(voucherEventStore, [])
    const mockedDocumentEventStore = mockEventStore(documentEventStore, [
        {
            type: 'DOCUMENTS:DOCUMENT_CREATED',
            aggregateId: 'i-exist',
            payload: { name: 'i-exist.pdf', key: 'mock/12345-i-exist.pdf' },
        },
    ])

    beforeEach(() => {
        mockedDocumentEventStore.reset()
    })

    const createVoucher = (input: CreateVoucherInput) =>
        createVoucherCommand.handler(input, [mockedVoucherEventStore, mockedDocumentEventStore], {
            generateId: () => 'voucherId',
        })

    it('Upload Document Command', async () => {
        const { voucherId } = await createVoucher({
            documentId: 'i-exist',
            creditOrDebit: 'DEBIT',
            vatTaxType: 'EU',
            voucherDate: createDateString(2023, 1, 15),
        })

        const { events } = await mockedVoucherEventStore.getEvents(voucherId)

        expect(events).toHaveLength(1)
        const [e] = events
        expect(e).toMatchObject({
            aggregateId: 'voucherId',
            version: 1,
            type: 'VOUCHER:VOUCHER_CREATED',
            payload: { documentId: 'i-exist' },
        })

        const { aggregate } = await mockedVoucherEventStore.getExistingAggregate(voucherId)

        expect(aggregate).toMatchObject({
            aggregateId: 'voucherId',
            version: 1,
            status: 'DRAFT',
            documentId: 'i-exist',
            items: [],
        })
        expect(aggregate.createdAt).toBeTruthy()
    })

    it('Create Voucher from non existing Document fails', async () => {
        expect(
            createVoucher({
                documentId: 'dont-exist',
                creditOrDebit: 'DEBIT',
                vatTaxType: 'EU',
                voucherDate: createDateString(2023, 1, 15),
            })
        ).rejects.toThrow('Unable to find aggregate dont-exist in event store DOCUMENTS.')
    })
})
