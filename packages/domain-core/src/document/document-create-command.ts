import z from 'zod'
import { diary } from 'diary'
import { Command } from '@chute/core'

import { DocumentCreatedEventTypeDetail, documentCreatedEventType } from './document-created-event'
import { DocumentEventStore } from './document-eventstore'

const logger = diary('document:cmd:create')

const createDocumentCommandInputSchema = z.object({
    key: z.string(),
    name: z.string().optional(),
    contentHash: z.string(),
    aggregateId: z.string(),
})
export type CreateDocumentInput = z.infer<typeof createDocumentCommandInputSchema>
export type CreateDocumentOutput = { aggregateId: string }

export const createDocumentCommand = new Command({
    commandId: 'document:cmd:create',

    handler: async (
        commandInput: CreateDocumentInput,
        { documentEventStore }: { documentEventStore: DocumentEventStore }
    ): Promise<CreateDocumentOutput> => {
        logger.info('input', commandInput)
        const { key, name, contentHash, aggregateId } =
            createDocumentCommandInputSchema.parse(commandInput)

        const event: DocumentCreatedEventTypeDetail = {
            aggregateId,
            version: 1,
            type: documentCreatedEventType.type,
            payload: documentCreatedEventType.payloadSchema!.parse({
                name: name,
                key,
                contentHash,
            }),
        }

        logger.info('Event', JSON.stringify(event, null, 4))
        await documentEventStore.pushEvent(event)

        return { aggregateId }
    },
})
