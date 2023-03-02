import { DateTimeString } from '../schema/date-schema'

export type EventDetail<T extends string = string, P = unknown, M = unknown> = {
    aggregateId: string
    version: number
    type: T
    timestamp: DateTimeString
    payload: P
    metadata: M
}
