import { subtle } from 'crypto'

import type { Aggregate } from '@castore/core'
import { z } from 'zod'
import { DateStringSchema, DateTimeStringSchema } from '@chute/core'

import { CurrencySchema } from '../shared/currency-schema'

export const TransactionSchema = z.object({
    accountId: z.string(),
    name: z.string().optional(),
    reference: z.string().optional(),
    date: DateTimeStringSchema.or(DateStringSchema),
    amount: z.number(),
    originalAmount: z.object({
        amount: z.number(),
        currency: CurrencySchema,
    }),
    createdAt: DateTimeStringSchema,
    updatedAt: DateTimeStringSchema.optional(),
})

export type TransactionData = z.infer<typeof TransactionSchema>

export interface TransactionAggregate extends Aggregate, TransactionData {}

/**
 * @TODO: Make this deterministic as an ULID with the DATE as timestamp portion
 */
export async function createHash(
    data: Pick<TransactionData, 'name' | 'reference' | 'date' | 'amount'>
) {
    const input = [data.name, data.reference, data.date, data.amount].filter(Boolean).join('-')

    const hash = await subtle.digest('SHA-256', Buffer.from(input, 'utf-8'))
    const id = Buffer.from(hash).toString('base64')
    return id
}
