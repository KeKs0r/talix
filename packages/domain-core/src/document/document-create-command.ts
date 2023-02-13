import z from 'zod'
import { tuple } from '@castore/core'
import { Command } from '@chute/core'

import { documentEventStore } from './document-eventstore'
import { DocumentCreatedEventTypeDetail, documentCreatedEventType } from './document-created-event'

const createDocumentCommandInputSchema = z.object({
    name: z.string().optional(),
    key: z.string(),
    aggregateId: z.string(),
})
export type CreateDocumentInput = z.infer<typeof createDocumentCommandInputSchema>
export type CreateDocumentOutput = { aggregateId: string }

export const createDocumentCommand = new Command({
    commandId: 'DOCUMENTS:CREATE_DOCUMENT',
    requiredEventStores: tuple(documentEventStore),
    handler: async (
        commandInput: CreateDocumentInput,
        [documentEventStore]
    ): Promise<CreateDocumentOutput> => {
        console.log('createDocumentCommand.handler', commandInput)
        const { key, name, aggregateId } = createDocumentCommandInputSchema.parse(commandInput)

        const event: DocumentCreatedEventTypeDetail = {
            aggregateId,
            version: 1,
            type: documentCreatedEventType.type,
            payload: documentCreatedEventType.payloadSchema!.parse({ name: name, key }),
        }

        console.log('Event', JSON.stringify(event, null, 4))
        await documentEventStore.pushEvent(event)

        return { aggregateId }
    },
})
