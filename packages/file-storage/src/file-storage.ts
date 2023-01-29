import type { ReadableStream, Blob } from '@cloudflare/workers-types'

export abstract class FileStorage {
    id = Symbol('FileStorage')
    abstract put(key: string, value: ReadableStream<any> | string | Blob): Promise<{ key: string }>
    abstract get(key: string): Promise<Blob | null>
}
