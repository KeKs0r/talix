import type { Aggregate } from '@castore/core'

type DateTimeString = string

export type VoucherStatus = 'DRAFT' | 'UNPAID' | 'PAID'

export interface VoucherAggregate extends Aggregate {
    status: VoucherStatus
    documentId: string
    createdAt: DateTimeString
    items: VoucherLineItem[]
}

export interface VoucherLineItem {}
