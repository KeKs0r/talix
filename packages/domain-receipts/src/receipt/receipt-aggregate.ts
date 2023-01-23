import type { Aggregate } from '@castore/core'

type DateTimeString = string

export type ReceiptStatus = 'DRAFT' | 'UNPAID' | 'PAID'

export interface ReceiptAggregate extends Aggregate {
    status: ReceiptStatus
    documentId: string
    createdAt: DateTimeString
    items: ReceiptLineItem[]
}

export interface ReceiptLineItem {}
