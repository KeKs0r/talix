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
    .brand('DateTime')

export type DateTimeString = z.infer<typeof DateTimeStringSchema>
