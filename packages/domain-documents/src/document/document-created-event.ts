import z from 'zod'
import { ZodEventType } from '@castore/zod-event'
import { EventTypeDetail } from '@castore/core'

const documentCreatedPayloadSchema = z.object({
    name: z.string(),
    url: z.string(),
})

const documentCreatedMetadataSchema = z.object({
    channel: z.string().optional(),
})

export const documentCreatedEventType = new ZodEventType({
    type: 'DOCUMENTS:DOCUMENT_CREATED',
    payloadSchema: documentCreatedPayloadSchema,
    metadataSchema: documentCreatedMetadataSchema,
})

export type DocumentCreatedEventTypeDetail = EventTypeDetail<typeof documentCreatedEventType>
