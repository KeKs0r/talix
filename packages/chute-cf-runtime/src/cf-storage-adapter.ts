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
import type { DurableObjectNamespace } from '@cloudflare/workers-types'
import { diary } from 'diary'

import type { DurableEntity } from './durable-entity'

const logger = diary('cf:storage-adapter')

type EntityMethod = Exclude<keyof DurableEntity, 'env' | 'fetch' | 'state'>

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
        const response = await (this.callObject(aggregateId, method, options) as ReturnType<
            DurableEntity['getEvents']
        >)
        return response
    }
    async pushEvent(
        eventDetail: EventDetail,
        context: PushEventContext
    ): Promise<{ event: EventDetail }> {
        const aggregateId = eventDetail.aggregateId
        const method = 'pushEvent'
        const response = await (this.callObject(aggregateId, method, eventDetail) as ReturnType<
            DurableEntity['pushEvent']
        >)
        return response
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

    protected async callObject(aggregateId: string, method: EntityMethod, body?: unknown) {
        const id = this.objectNamespace.idFromName(aggregateId)
        const stub = this.objectNamespace.get(id)

        logger.info('Calling', method, 'for', aggregateId, 'with')
        // logger.info('DurableId', id)
        // logger.info('Body', body)
        const result = await stub.fetch(`https://durableobject?method=${method}`, {
            method: body ? 'POST' : 'GET',
            body: body ? JSON.stringify(body) : undefined,
        })

        const response = await (result.json() as ReturnType<DurableEntity[typeof method]>)
        // logger.info('Response', response)
        return response
    }
}
