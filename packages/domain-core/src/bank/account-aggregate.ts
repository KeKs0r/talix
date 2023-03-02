import type { Aggregate } from '@castore/core'

type Currency = string

export interface BankAccountAggregate extends Aggregate {
    id: string
    label: string
    currency: Currency
}
