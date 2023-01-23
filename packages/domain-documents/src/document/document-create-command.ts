/// <reference lib="dom" />
import { basename } from 'path'

import z from 'zod'
import { Command, tuple } from '@castore/core'

import { documentEventStore } from './document-eventstore'
import { DocumentCreatedEventTypeDetail } from './document-created-event'

const createDocumentCommandInputSchema = z.object({
    name: z.string().optional(),
    url: z.string(),
})
export type CreateDocumentInput = z.infer<typeof createDocumentCommandInputSchema>
type Output = { documentId: string }
type Context = { generateUuid: () => string }

export const createDocumentCommand = new Command({
    commandId: 'DOCUMENTS:CREATE_DOCUMENT',
    requiredEventStores: tuple(documentEventStore),
    handler: async (
        commandInput: CreateDocumentInput,
        [documentEventStore],
        { generateUuid }: Context
    ): Promise<Output> => {
        const { url, name } = createDocumentCommandInputSchema.parse(commandInput)

        const res = await fetch(url)
        if (res.status !== 200) {
            throw new Error('Document is not accessible')
        }

        const documentId = generateUuid()

        const event: DocumentCreatedEventTypeDetail = {
            aggregateId: documentId,
            version: 1,
            type: 'DOCUMENTS:DOCUMENT_CREATED',
            payload: { name: name || basename(url), url },
        }

        await documentEventStore.pushEvent(event)

        return { documentId }
    },
})
