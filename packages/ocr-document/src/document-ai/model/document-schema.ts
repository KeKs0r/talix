import { z } from 'zod'

import { EntitySchema } from './expense-schema'

function createAiResponse(entitySchema: z.Schema) {
    return z.object({
        document: z.object({
            uri: z.string(),
            mimeType: z.string(),
            text: z.string(),
            pages: z.array(z.any()),
            entities: z.array(entitySchema),
        }),
        humanReviewStatus: z.object({
            state: z.enum(['SKIPPED']),
            stateMessage: z.string(),
        }),
    })
}

export const ExpenseResponseSchema = createAiResponse(EntitySchema)
export type ExpenseResponse = z.infer<typeof ExpenseResponseSchema>
