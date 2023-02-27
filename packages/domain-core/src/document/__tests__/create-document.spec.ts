import { describe, beforeEach, it, expect } from 'vitest'
import { asValue } from 'awilix'
import { Command, GetCommandInput, mockEventStore } from '@chute/core'

import { documentEventStore } from '../document-eventstore'
import { uploadDocumentFromUrlAction } from '../upload-document-url-action'
import { makeTestDependencies } from '../../shared/__test__/make-test-deps'

describe.concurrent('Upload Document From Url', () => {
    const mockedDocumentEventStore = mockEventStore(documentEventStore, [])
    function runCommand(command: Command, input: GetCommandInput<Command>) {
        return command.handler(input, [mockedDocumentEventStore], deps)
    }
    const deps = makeTestDependencies({
        runCommand: asValue(runCommand),
        generateId: asValue(() => '1'),
    })

    beforeEach(() => {
        mockedDocumentEventStore.reset()
    })

    it('Upload Document Command', async () => {
        const { documentId } = await uploadDocumentFromUrlAction.handler(
            {
                url: 'https://www.laserfocus.io/bitcoin.pdf',
                mimeType: 'application/pdf',
                hash: '123456',
            },
            deps
        )

        const { events } = await mockedDocumentEventStore.getEvents(documentId)

        expect(events).toHaveLength(1)
        const [e] = events
        expect(e).toMatchObject({
            aggregateId: '1',
            version: 1,
            type: 'DOCUMENTS:DOCUMENT_CREATED',
            payload: {
                key: 'documents/1-bitcoin.pdf',
                name: 'bitcoin.pdf',
                contentHash: '123456',
            },
        })

        const { aggregate } = await mockedDocumentEventStore.getExistingAggregate(documentId)

        expect(aggregate).toMatchObject({
            aggregateId: '1',
            version: 1,
            key: 'documents/1-bitcoin.pdf',
            status: 'CREATED',
        })
        // expect(aggregate.createdAt).toBeTruthy()
    })

    it('Upload Document Command fails, if the url is not accessible', async () => {
        expect(
            uploadDocumentFromUrlAction.handler(
                { url: 'https://www.google.com/i-dont-exist.pdf', mimeType: 'application/pdf' },
                deps
            )
        ).rejects.toThrow('Document could not be fetched')
    })
})
