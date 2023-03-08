import { z } from 'zod'

export const DateTimeStringSchema = z
    .string()
    .refine(
        (val: string) => {
            const d = new Date(val)
            return d.toString() !== 'Invalid Date'
        },
        {
            message: 'Invalid datetime',
        }
    )
    .brand('DateTimeString')

export type DateTimeString = z.infer<typeof DateTimeStringSchema>

export const DateStringSchema = z
    .string()
    .refine(
        (val: string) => {
            const d = new Date(val)
            return d.toString() !== 'Invalid Date'
        },
        {
            message: 'Invalid datetime',
        }
    )
    .brand('DateString')

export type DateString = z.infer<typeof DateStringSchema>

declare global {
    interface Date {
        constructor(input: DateTimeString): Date
        toISOString(): DateTimeString
    }
}
