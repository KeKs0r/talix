import z from 'zod'
import { Command, tuple } from '@castore/core'

import { documentEventStore } from './document-eventstore'
import { DocumentCreatedEventTypeDetail, documentCreatedEventType } from './document-created-event'

const createDocumentCommandInputSchema = z.object({
    name: z.string().optional(),
    key: z.string(),
    documentId: z.string().optional(),
})
export type CreateDocumentInput = z.infer<typeof createDocumentCommandInputSchema>
type Output = { documentId: string }
type Context = { generateId: () => string }

export const createDocumentCommand = new Command({
    commandId: 'DOCUMENTS:CREATE_DOCUMENT',
    requiredEventStores: tuple(documentEventStore),
    handler: async (
        commandInput: CreateDocumentInput,
        [documentEventStore],
        { generateId }: Context
    ): Promise<Output> => {
        const {
            key,
            name,
            documentId: inputDocumentId,
        } = createDocumentCommandInputSchema.parse(commandInput)

        const documentId = inputDocumentId || generateId()

        const event: DocumentCreatedEventTypeDetail = {
            aggregateId: documentId,
            version: 1,
            type: documentCreatedEventType.type,
            payload: documentCreatedEventType.payloadSchema.parse({ name: name, key }),
        }

        await documentEventStore.pushEvent(event)

        return { documentId }
    },
})
