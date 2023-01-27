import type {
    StorageAdapter,
    EventsQueryOptions,
    EventDetail,
    Aggregate,
    ListAggregateIdsOptions,
    ListAggregateIdsOutput,
    PushEventContext,
} from '@castore/core'
import {
    GetLastSnapshotOptions,
    ListSnapshotsOptions,
} from '@castore/core/dist/types/storageAdapter'
import type { DurableObjectState } from '@cloudflare/workers-types'

export class DurableStorageAdapter implements StorageAdapter {
    state: DurableObjectState
    constructor(state: DurableObjectState) {
        this.state = state
    }
    async pushEvent(
        eventDetail: EventDetail,
        context: PushEventContext
    ): Promise<{ event: EventDetail }> {
        await this.state.storage.put(eventDetail.version, eventDetail)
        return {
            event: eventDetail,
        }
    }
    async getEvents(
        aggregateId: string,
        options?: EventsQueryOptions | undefined
    ): Promise<{ events: EventDetail[] }> {
        const listOptions = mapOptions(options)
        const events = await this.state.storage.list<EventDetail>(listOptions)
        const asArray = Object.values(events).sort((a, b) => a.version - b.version)
        return {
            events: asArray,
        }
    }

    async listAggregateIds(
        options?: ListAggregateIdsOptions | undefined
    ): Promise<ListAggregateIdsOutput> {
        throw new Error('Not implemented')
    }
    async putSnapshot(aggregate: Aggregate): Promise<void> {
        throw new Error('Not implemented')
    }
    async getLastSnapshot(
        aggregateId: string,
        options?: GetLastSnapshotOptions | undefined
    ): Promise<{ snapshot: Aggregate | undefined }> {
        throw new Error('Not implemented')
    }
    async listSnapshots(
        aggregateId: string,
        options?: ListSnapshotsOptions | undefined
    ): Promise<{ snapshots: Aggregate[] }> {
        throw new Error('Not implemented')
    }
}

function mapOptions(
    options?: EventsQueryOptions | undefined
): DurableObjectListOptions | undefined {
    if (!options) {
        return
    }
    return {
        start: options.minVersion?.toString(),
        end: options.maxVersion?.toString(),
        reverse: options.reverse,
        limit: options.limit,
    }
}
