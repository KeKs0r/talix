import { describe, beforeEach, it, expect } from 'vitest'
import { mockEventStore } from '@castore/test-tools'
import { getMockStorage } from 'cf-r2-file-storage'

import { documentEventStore } from '../document-eventstore'
import { createDocumentCommand } from '../document-create-command'
import { createUploadDocumentFromUrlAction } from '../upload-document-url-action'

describe.concurrent('Upload Document', () => {
    const fileStorage = getMockStorage()
    const mockedDocumentEventStore = mockEventStore(documentEventStore, [])

    beforeEach(() => {
        mockedDocumentEventStore.reset()
    })

    const uploadFromUrl = createUploadDocumentFromUrlAction({
        fileStorage,
        createDocument: (input) =>
            createDocumentCommand.handler(input, [mockedDocumentEventStore], {
                generateId: () => '1',
            }),
        generateId: () => '1',
    })

    it('Upload Document Command', async () => {
        const { documentId } = await uploadFromUrl({ url: 'https://www.laserfocus.io/bitcoin.pdf' })

        const { events } = await mockedDocumentEventStore.getEvents(documentId)

        expect(events).toHaveLength(1)
        const [e] = events
        expect(e).toMatchObject({
            aggregateId: '1',
            version: 1,
            type: 'DOCUMENTS:DOCUMENT_CREATED',
            payload: {
                key: '1-bitcoin.pdf',
                name: 'bitcoin.pdf',
            },
        })

        const { aggregate } = await mockedDocumentEventStore.getExistingAggregate(documentId)

        expect(aggregate).toMatchObject({
            aggregateId: '1',
            version: 1,
            key: '1-bitcoin.pdf',
            status: 'CREATED',
        })
        // expect(aggregate.createdAt).toBeTruthy()
    })

    it('Upload Document Command fails, if the url is not accessible', async () => {
        expect(uploadFromUrl({ url: 'https://www.google.com/i-dont-exist.pdf' })).rejects.toThrow(
            'Document could not be fetched'
        )
    })
})
