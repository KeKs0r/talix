import { it, expect } from 'vitest'

import { createHash } from '../transaction-aggregate'

it('Creates a Deterministic Transaction Id', async () => {
    const a = await createHash({
        amount: 3,
        date: new Date('2022-01-01').toISOString(),
        name: 'name',
        reference: 'reference',
    })
    const b = await createHash({
        amount: 3,
        date: new Date('2022-01-01').toISOString(),
        name: 'name',
        reference: 'reference',
    })
    expect(a).toEqual(b)
})
