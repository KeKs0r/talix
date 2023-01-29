import type { R2Bucket, ReadableStream, Blob } from '@cloudflare/workers-types'

import { FileStorage } from './file-storage'

export class R2FileStorage extends FileStorage {
    bucket: R2Bucket
    constructor(bucket: R2Bucket) {
        super()
        this.bucket = bucket
    }
    async put(key: string, value: ReadableStream<any> | string | Blob) {
        const file = await this.bucket.put(key, value as any)
        return {
            key: file.key,
        }
    }
    async get(key: string) {
        const response = await this.bucket.get(key)
        if (!response) {
            return null
        }
        return response.blob()
    }
}
