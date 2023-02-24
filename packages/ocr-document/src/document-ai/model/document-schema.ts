import { z } from 'zod'

import { EntitySchema } from './expense-schema'

function createAiResponse(entitySchema: z.Schema) {
    return z.object({
        error: z.undefined(),
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
export const ExpenseSuccessResponseSchema = createAiResponse(EntitySchema)
export type ExpenseSuccessResponse = z.infer<typeof ExpenseSuccessResponseSchema>
export const ExpenseErrorResponse = z.object({
    error: z.object({
        code: z.number(),
        message: z.string(),
        status: z.string(),
        details: z.array(
            z.object({
                '@type': z.string(),
                fieldViolations: z
                    .array(
                        z.object({
                            field: z.string(),
                            description: z.string(),
                        })
                    )
                    .optional(),
            })
        ),
    }),
})

export function isSuccessResponse(res: ExpenseResponse): res is ExpenseSuccessResponse {
    return !res.error
}

export const ExpenseResponseSchema = ExpenseSuccessResponseSchema.or(ExpenseErrorResponse)

export type ExpenseResponse = z.infer<typeof ExpenseResponseSchema>
