import { Service } from 'castore-extended'

import { createHTTPActions } from './http'
import { createQueue } from './queue'

/**
 * Cloudflare Runtime wraps all the with the necessary runtime
 */
export function createCloudflareRuntime(...services: Service[]) {
    const hono = createHTTPActions(services)
    const queue = createQueue(services)
    return {
        hono,
        fetch: hono.fetch,
        queue,
    }
}
