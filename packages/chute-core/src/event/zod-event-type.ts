import { z, ZodType } from 'zod'

import type { EventDetail } from './event-detail'
import type { EventType } from './event-type'

export class ZodEventType<
    T extends string = string,
    PS extends ZodType | undefined = ZodType | undefined,
    P = ZodType extends PS
        ? string extends T
            ? unknown
            : never
        : PS extends ZodType
        ? z.infer<PS>
        : never,
    MS extends ZodType | undefined = ZodType | undefined,
    M = ZodType extends MS
        ? string extends T
            ? unknown
            : never
        : MS extends ZodType
        ? z.infer<MS>
        : never
> implements EventType<T, P, M>
{
    _types?: {
        detail: EventDetail<T, P, M>
    }
    type: T
    payloadSchema?: PS
    metadataSchema?: MS

    constructor({
        type,
        payloadSchema,
        metadataSchema,
    }: {
        type: T
        payloadSchema?: PS
        metadataSchema?: MS
    }) {
        this.type = type
        this.payloadSchema = payloadSchema
        this.metadataSchema = metadataSchema
    }

    create(
        { aggregateId, version }: { aggregateId: string; version: number },
        payload: P,
        //@TODO: this is what castore tried to solve, to have metadta optional, but onky if its undefeind
        metadata?: M
    ): EventDetail<T, P, M> {
        return {
            type: this.type,
            aggregateId,
            version,
            timestamp: new Date().toISOString(),
            payload: this.payloadSchema?.parse(payload),
            metadata: this.metadataSchema?.parse(metadata),
        }
    }
}
