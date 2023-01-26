import z from 'zod'
import { ZodEventType } from '@castore/zod-event'
import { EventTypeDetail } from '@castore/core'

const documentCreatedPayloadSchema = z.object({
    name: z.string(),
    key: z.string(),
})

const documentCreatedMetadataSchema = z.object({
    channel: z.string().optional(),
})

export const documentCreatedEventType = new ZodEventType<
    'DOCUMENTS:DOCUMENT_CREATED',
    typeof documentCreatedPayloadSchema
>({
    type: 'DOCUMENTS:DOCUMENT_CREATED',
    payloadSchema: documentCreatedPayloadSchema,
    metadataSchema: documentCreatedMetadataSchema,
})

export type DocumentCreatedPayload = z.infer<typeof documentCreatedPayloadSchema>
export type DocumentCreatedEventTypeDetail = EventTypeDetail<typeof documentCreatedEventType>
