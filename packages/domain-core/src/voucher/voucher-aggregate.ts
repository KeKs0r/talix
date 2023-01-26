import type { Aggregate } from '@castore/core'

type DateTimeString = string

export type VoucherStatus = 'DRAFT' | 'UNPAID' | 'PAID'
export type VatTaxType = 'EU' | 'NON_EU'

export interface VoucherAggregate extends Aggregate {
    status: VoucherStatus
    documentId: string
    createdAt: DateTimeString
    updatedAt: DateTimeString

    vatTaxType: VatTaxType
    voucherDate: DateTimeString
    deliveryDate: DateTimeString
    creditDebit: 'CREDIT' | 'DEBIT'
    supplierName: string
    supplierAddress: string

    items: VoucherLineItem[]
}

export interface VoucherLineItem {}
