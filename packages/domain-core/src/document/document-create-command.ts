import z from 'zod'
import { diary } from 'diary'
import { tuple } from '@castore/core'
import { Command } from '@chute/core'

import { documentEventStore } from './document-eventstore'
import { DocumentCreatedEventTypeDetail, documentCreatedEventType } from './document-created-event'

const logger = diary('document:cmd:create')

const createDocumentCommandInputSchema = z.object({
    key: z.string(),
    name: z.string().optional(),
    hash: z.string().optional(),
    aggregateId: z.string(),
})
export type CreateDocumentInput = z.infer<typeof createDocumentCommandInputSchema>
export type CreateDocumentOutput = { aggregateId: string }

export const createDocumentCommand = new Command({
    commandId: 'document:cmd:create',
    requiredEventStores: tuple(documentEventStore),
    handler: async (
        commandInput: CreateDocumentInput,
        [documentEventStore]
    ): Promise<CreateDocumentOutput> => {
        logger.info('input', commandInput)
        const { key, name, aggregateId } = createDocumentCommandInputSchema.parse(commandInput)

        const event: DocumentCreatedEventTypeDetail = {
            aggregateId,
            version: 1,
            type: documentCreatedEventType.type,
            payload: documentCreatedEventType.payloadSchema!.parse({ name: name, key }),
        }

        logger.info('Event', JSON.stringify(event, null, 4))
        await documentEventStore.pushEvent(event)

        return { aggregateId }
    },
})
