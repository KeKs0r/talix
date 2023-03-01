import { z } from 'zod'
import type { Aggregate } from '@castore/core'

type DateTimeString = string
export const vatTaxTypeSchema = z.enum(['EU', 'NON_EU'])
export const voucherStatusSchema = z.enum(['DRAFT', 'UNPAID', 'PAID'])
export const creditOrDebitSchema = z.enum(['CREDIT', 'DEBIT'])

export type VoucherStatus = z.infer<typeof voucherStatusSchema>
export type VatTaxType = z.infer<typeof vatTaxTypeSchema>
type CreditOrDebit = z.infer<typeof creditOrDebitSchema>

export interface VoucherAggregate extends Aggregate {
    status: VoucherStatus
    documentId: string
    documentHash?: string
    createdAt: DateTimeString
    updatedAt?: DateTimeString

    vatTaxType?: VatTaxType
    voucherDate?: DateTimeString
    deliveryDate?: DateTimeString
    creditOrDebit?: CreditOrDebit
    supplierName?: string
    supplierAddress?: string
    predictions?: any

    duplicates?: DuplicateState

    items: VoucherLineItem[]
}

interface DuplicateState {
    didRun: boolean
    duplicates: string[]
}

export interface VoucherLineItem {
    sum: number
    vatTaxRate: number
    description: string
    isNetAmount: boolean
}
