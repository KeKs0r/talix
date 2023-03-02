import { z } from 'zod'

export const CurrencySchema = z.enum(['EUR', 'USD', 'CHF'])
export type Currency = z.infer<typeof CurrencySchema>
