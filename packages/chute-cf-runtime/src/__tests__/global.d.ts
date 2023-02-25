import type { describe } from 'vitest'
import type { ExecutionContext as _ExecutionContext } from '@cloudflare/workers-types'

import type { Env } from '../env.types'

declare global {
    function setupMiniflareIsolatedStorage(): typeof describe
    function getMiniflareBindings(): {
        DURABLE_ENTITY: DurableObjectNamespace
    }
    function getMiniflareDurableObjectStorage(id: DurableObjectId): Promise<DurableObjectStorage>
    function getMiniflareWaitUntil<WaitUntil extends any[] = unknown[]>(
        event: FetchEvent | ScheduledEvent | ExecutionContext
    ): Promise<WaitUntil>
    class ExecutionContext extends _ExecutionContext {}
}
