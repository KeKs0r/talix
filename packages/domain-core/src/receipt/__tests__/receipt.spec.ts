import { describe, beforeEach, it, expect } from 'vitest'
import { mockEventStore } from 'castore-extended'

import { documentEventStore } from '../../document'
import { receiptEventStore } from '../receipt-eventstore'
import { createReceiptCommand, CreateReceiptInput } from '../receipt-create-command'

describe.concurrent('Upload Document', () => {
    const mockedReceiptEventStore = mockEventStore(receiptEventStore, [])
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

    const createReceipt = (input: CreateReceiptInput) =>
        createReceiptCommand.handler(input, [mockedReceiptEventStore, mockedDocumentEventStore], {
            generateId: () => 'receiptId',
        })

    it('Upload Document Command', async () => {
        const { receiptId } = await createReceipt({ documentId: 'i-exist' })

        const { events } = await mockedReceiptEventStore.getEvents(receiptId)

        expect(events).toHaveLength(1)
        const [e] = events
        expect(e).toMatchObject({
            aggregateId: 'receiptId',
            version: 1,
            type: 'RECEIPT:RECEIPT_CREATED',
            payload: { documentId: 'i-exist' },
        })

        const { aggregate } = await mockedReceiptEventStore.getExistingAggregate(receiptId)

        expect(aggregate).toMatchObject({
            aggregateId: 'receiptId',
            version: 1,
            status: 'DRAFT',
            documentId: 'i-exist',
            items: [],
        })
        expect(aggregate.createdAt).toBeTruthy()
    })

    it('Create Receipt from non existing Document', async () => {
        expect(createReceipt({ documentId: 'dont-exist' })).rejects.toThrow(
            'Unable to find aggregate dont-exist in event store DOCUMENTS.'
        )
    })
})
