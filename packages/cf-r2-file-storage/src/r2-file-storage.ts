import type { R2Bucket, ReadableStream } from '@cloudflare/workers-types'

export type FileStorage = {
    put: (key: string, value: ReadableStream<any> | string | Blob) => Promise<{ key: string }>
    get: (key: string) => Promise<R2ObjectBody | null>
}

export function createFileStorage(bucket: R2Bucket) {
    return {
        put: async (key: string, value: ReadableStream<any> | string | Blob) => {
            const file = await bucket.put(key, value as any)
            return {
                key: file.key,
            }
        },
        get: async (key: string) => bucket.get(key),
    }
}
