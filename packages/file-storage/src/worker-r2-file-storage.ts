import assert from 'assert'

import type { R2Bucket, ReadableStream } from '@cloudflare/workers-types'

export type FileStorage = {
    put: (key: string, value: ReadableStream<any> | string | Blob) => Promise<{ key: string }>
    get: (key: string) => Promise<Blob | null>
}

export function createFileStorage(bucket: R2Bucket) {
    return {
        put: async (key: string, value: ReadableStream<any> | string | Blob) => {
            const file = await bucket.put(key, value as any)
            return {
                key: file.key,
            }
        },
        get: async (key: string) => {
            const response = await bucket.get(key)
            assert(response, `Response not available for ${key}`)
            return response.blob()
        },
    }
}
