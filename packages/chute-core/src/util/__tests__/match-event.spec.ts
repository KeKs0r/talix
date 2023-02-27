import { describe, it, expect } from 'vitest'

import { matchName } from '../match-event'

describe('matchEvent', () => {
    it('Match same', () => {
        expect(matchName('DOCUMENTS:CREATED', 'DOCUMENTS:CREATED')).toBe(true)
        expect(matchName('DOCUMENTS:UPDATED', 'DOCUMENTS:CREATED')).toBe(false)
    })
    it('Match wildcard', () => {
        expect(matchName('DOCUMENTS:CREATED', 'DOCUMENTS:*')).toBe(true)
        expect(matchName('DOCUMENTS:UPDATED', 'DOCUMENTS:*')).toBe(true)
        expect(matchName('VOUCHER:UPDATED', 'DOCUMENTS:*')).toBe(false)
    })
})
