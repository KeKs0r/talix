import { R2Bucket } from '@cloudflare/workers-types'

export type FileStorage = ReturnType<typeof createFileStorage>

export function createFileStorage(bucket: R2Bucket) {
    return {
        put: async (key: string, value: ReadableStream<any> | string | Blob) => {
            return bucket.put(key, value as any)
        },
        get: async (key: string) => bucket.get(key),
    }
}
