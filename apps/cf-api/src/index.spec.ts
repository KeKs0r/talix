import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

describe('Worker', () => {
    let worker: UnstableDevWorker

    beforeAll(async () => {
        worker = await unstable_dev('src/index.ts', {
            experimental: { disableExperimentalWarning: true },
        })
    })

    afterAll(async () => {
        await worker.stop()
    })

    it('should return Hello World', async () => {
        const resp = await worker.fetch('/check')

        const text = await resp.text()
        expect(text).toMatchInlineSnapshot(`"Hello World!"`)
    })

    it('Can access r2', async () => {
        const resp = await worker.fetch('/r2')
        const text = await resp.text()
        console.log(text)
    })
})
