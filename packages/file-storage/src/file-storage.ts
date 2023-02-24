import type { ReadableStream, Blob, R2ObjectBody } from '@cloudflare/workers-types'

export type PutOptions = {
    httpMetadata?: {
        contentType?: string
        contentEncoding?: string
        contentLanguage?: string
    }
}

export abstract class FileStorage {
    id = Symbol('FileStorage')
    abstract put(
        key: string,
        value: ReadableStream<any> | string | Blob,
        options?: PutOptions
    ): Promise<{ key: string }>
    /**
     * This is supposed to be a neutral interface, but too difficult.
     */
    abstract get(key: string): Promise<R2ObjectBody | null>
}
