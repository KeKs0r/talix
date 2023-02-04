import type {
    Aggregate,
    EventsQueryOptions,
    ListAggregateIdsOptions,
    ListAggregateIdsOutput,
    PushEventContext,
    StorageAdapter,
    EventDetail,
} from '@castore/core'
import {
    GetLastSnapshotOptions,
    ListSnapshotsOptions,
} from '@castore/core/dist/types/storageAdapter'

export class CfStorageAdapter implements StorageAdapter {
    objectNamespace: DurableObjectNamespace
    constructor(objectNamespace: DurableObjectNamespace) {
        this.objectNamespace = objectNamespace
    }
    async getEvents(
        aggregateId: string,
        options?: EventsQueryOptions | undefined
    ): Promise<{ events: EventDetail[] }> {
        const method = 'getEvents'
        const events = await this.callObject<EventDetail[]>(aggregateId, method, options)
        return { events }
    }
    async pushEvent(
        eventDetail: EventDetail,
        context: PushEventContext
    ): Promise<{ event: EventDetail }> {
        const aggregateId = eventDetail.aggregateId
        const method = 'pushEvent'
        const event = await this.callObject(aggregateId, method, eventDetail)
        return { event }
    }
    async listAggregateIds(
        options?: ListAggregateIdsOptions | undefined
    ): Promise<ListAggregateIdsOutput> {
        throw new Error('Not Implemented. Need to be done via KV')
    }
    async putSnapshot(aggregate: Aggregate): Promise<void> {
        throw new Error('Not Implemented. Need to be done via DO')
    }
    async getLastSnapshot(
        aggregateId: string,
        options?: GetLastSnapshotOptions | undefined
    ): Promise<{ snapshot: Aggregate | undefined }> {
        throw new Error('Not Implemented. Need to be done via DO')
    }
    async listSnapshots(
        aggregateId: string,
        options?: ListSnapshotsOptions | undefined
    ): Promise<{ snapshots: Aggregate[] }> {
        throw new Error('Not Implemented. Need to be done via DO')
    }

    protected async callObject<Response>(aggregateId: string, method: string, body?: unknown) {
        const id = this.objectNamespace.idFromName(aggregateId)
        const stub = this.objectNamespace.get(id)

        const req = new Request(new URL(`https://durableobject?method=${method}`), {
            method: body ? 'POST' : 'GET',
            body: body ? JSON.stringify(body) : undefined,
        })
        const result = await stub.fetch(req)
        const response = await result.json<Response>()
        return response
    }
}
