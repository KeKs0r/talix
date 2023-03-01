import { describe, beforeEach, it, expect } from 'vitest'
import { asFunction, asValue } from 'awilix'
import { Command, GetCommandInput, mockEventStore } from '@chute/core'

import { createDocumentEventStore, DocumentEventStore } from '../document-eventstore'
import { uploadDocumentFromUrlAction } from '../upload-document-url-action'
import { makeTestDependencies } from '../../shared/__test__/make-test-deps'
import { documentCreatedEventType } from '../document-created-event'

describe.concurrent('Upload Document From Url', () => {
    function getFixtures() {
        const container = makeTestDependencies({
            runCommand: asValue(runCommand),
            generateId: asValue(() => '1'),
        })
        container.register('documentStore', asFunction(createDocumentEventStore))

        const deps = container.cradle

        function runCommand(command: Command, input: GetCommandInput<Command>) {
            return command.run(input, deps)
        }

        const documentStore = container.resolve('documentStore') as DocumentEventStore
        return {
            container,
            documentStore,
            runCommand,
        }
    }

    it('Upload Document Command', async () => {
        const { container, documentStore } = getFixtures()
        const { documentId } = await uploadDocumentFromUrlAction.handler(
            {
                url: 'https://www.laserfocus.io/bitcoin.pdf',
                mimeType: 'application/pdf',
                hash: '123456',
            },
            container.cradle
        )

        const { events } = await documentStore.getEvents(documentId)

        expect(events).toHaveLength(1)
        const [e] = events
        expect(e).toMatchObject({
            aggregateId: '1',
            version: 1,
            type: documentCreatedEventType.type,
            payload: {
                key: 'documents/1-bitcoin.pdf',
                name: 'bitcoin.pdf',
                contentHash: '123456',
            },
        })

        const { aggregate } = await documentStore.getExistingAggregate(documentId)

        expect(aggregate).toMatchObject({
            aggregateId: '1',
            version: 1,
            key: 'documents/1-bitcoin.pdf',
            status: 'CREATED',
        })
        // expect(aggregate.createdAt).toBeTruthy()
    })

    it('Upload Document Command fails, if the url is not accessible', async () => {
        const { container, documentStore } = getFixtures()
        expect(
            uploadDocumentFromUrlAction.handler(
                { url: 'https://www.google.com/i-dont-exist.pdf', mimeType: 'application/pdf' },
                container.cradle
            )
        ).rejects.toThrow('Document could not be fetched')
    })
})
