import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

describe.skip('Worker', () => {
    let worker: UnstableDevWorker

    beforeAll(async () => {
        expect(process.env).toHaveProperty('TELEGRAM_BOT_TOKEN')
        worker = await unstable_dev('src/index.ts', {
            vars: {
                TELEGRAM_BOT_TOKEN: process.env['TELEGRAM_BOT_TOKEN'],
            },
            experimental: { disableExperimentalWarning: true },
        })
    }, 20 * 1000)

    afterAll(async () => {
        await worker.stop()
    })

    it('Can build app and run health check', async () => {
        const resp = await worker.fetch('/health-check')

        const res = await resp.json()
        expect(res).toHaveProperty('status', 'ok')
    })
})
