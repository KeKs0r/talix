import crypto from 'crypto'

import ok from 'tiny-invariant'
import { describe, it, expect } from 'vitest'

import { createFileStorage } from '../fetch-r2-file-storage'

describe.concurrent(
    'Fetch R2 File Storage',
    () => {
        const accessKeyId = process.env.CF_R2_ACCESS_KEY_ID
        ok(accessKeyId, 'CF_R2_ACCESS_KEY_ID is not set')
        const secretAccessKey = process.env.CF_R2_SECRET_ACCESS_KEY
        ok(secretAccessKey, 'CF_R2_SECRET_ACCESS_KEY is not set')
        const accountId = process.env.CF_ACCOUNT_ID
        ok(accountId, 'CF_ACCOUNT_ID is not set')

        const storage = createFileStorage({
            accessKeyId,
            secretAccessKey,
            accountId,
            bucketName: 'talix-documents-preview',
        })

        ;(globalThis as any).crypto = crypto
        it('Can get existing File', async () => {
            const file = await storage.get('rolling-dog.gif')
            expect(file.headers.get('content-type')).toBe('image/gif')
        })

        it('Can Upload File', async () => {
            const key = `ci/test-${Date.now()}.json`
            await storage.put(key, JSON.stringify({ hello: 'world' }), {
                contentType: 'application/json',
            })
            const file = await storage.get(key)
            expect(file.headers.get('content-type')).toBe('application/json')
            const content = await file.text()
            expect(content).toBe(JSON.stringify({ hello: 'world' }))
        })
    },
    { timeout: 10 * 1000 }
)
