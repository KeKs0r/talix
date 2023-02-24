import { describe, it, expect } from 'vitest'

import { ExpenseSuccessResponseSchema } from '../document-schema'

describe('Expense Schema', () => {
    it('FiveKit', () => {
        const fivekit = require('./fixture/fivekit.json')
        ExpenseSuccessResponseSchema.parse(fivekit)
    })
    it('Surfescape', () => {
        const surfescape = require('./fixture/surfescape.json')
        ExpenseSuccessResponseSchema.parse(surfescape)
    })
})
