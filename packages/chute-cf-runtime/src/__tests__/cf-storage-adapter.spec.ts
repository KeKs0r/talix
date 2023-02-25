import { it, expect } from 'vitest'

import { CfStorageAdapter } from '../cf-storage-adapter'

const describe = setupMiniflareIsolatedStorage()
describe('CF Storage Adapter', () => {
    it('Push Event & Receive', async () => {
        const { DURABLE_ENTITY } = getMiniflareBindings()
        const adapter = new CfStorageAdapter(DURABLE_ENTITY)

        const event = {
            aggregateId: 'test',
            version: 1,
            payload: {
                type: 'test',
            },
        }
        const r = await adapter.pushEvent(event, {})
        expect(r).toHaveProperty('event', event)

        const { events } = await adapter.getEvents('test')
        expect(events).toHaveLength(1)
        expect(events[0]).toEqual(event)
    })
})
