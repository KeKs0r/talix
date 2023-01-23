import { describe, beforeEach, it, expect } from 'vitest'
import { mockEventStore } from '@castore/test-tools'

import { documentEventStore } from '../document-eventstore'
import { createDocumentCommand } from '../document-create-command'

describe.concurrent('Upload Document', () => {
    const mockedDocumentEventStore = mockEventStore(documentEventStore, [])
    beforeEach(() => {
        mockedDocumentEventStore.reset()
    })

    it('Upload Document Command', async () => {
        const { documentId } = await createDocumentCommand.handler(
            { url: 'https://www.laserfocus.io/bitcoin.pdf' },
            [mockedDocumentEventStore],
            { generateUuid: () => '1' }
        )

        const { events } = await mockedDocumentEventStore.getEvents(documentId)

        expect(events).toHaveLength(1)
        const [e] = events
        expect(e).toMatchObject({
            aggregateId: '1',
            version: 1,
            type: 'DOCUMENTS:DOCUMENT_CREATED',
            payload: {
                name: 'bitcoin.pdf',
                url: 'https://www.laserfocus.io/bitcoin.pdf',
            },
        })

        const { aggregate } = await mockedDocumentEventStore.getExistingAggregate(documentId)

        expect(aggregate).toMatchObject({
            aggregateId: '1',
            version: 1,
            name: 'bitcoin.pdf',
            url: 'https://www.laserfocus.io/bitcoin.pdf',
            status: 'CREATED',
        })
        expect(aggregate.createdAt).toBeTruthy()
    })

    it('Upload Document Command fails, if the url is not accessible', async () => {
        expect(
            createDocumentCommand.handler(
                { url: 'https://www.google.com/i-dont-exist.pdf' },
                [mockedDocumentEventStore],
                { generateUuid: () => '1' }
            )
        ).rejects.toThrow('Document is not accessible')
    })
})
