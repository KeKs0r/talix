import type { Aggregate } from '@castore/core'

type DateTimeString = string

export interface DocumentAggregate extends Aggregate {
    name: string
    key: string
    status: 'CREATED' | 'ANALYZED'
    contentHash: string
    createdAt: DateTimeString
}
