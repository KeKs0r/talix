import type { EventDetail, EventsQueryOptions } from '@castore/core'
import type { DurableObjectState, Request } from '@cloudflare/workers-types'
import { createDocumentCommand, getDocumentEventStore } from 'domain-core'

import type { Bindings } from '../env.types'

export class DurableEntity {
    state: DurableObjectState
    env: Bindings

    constructor(state: DurableObjectState, env: Bindings) {
        this.state = state
        this.env = env
    }
    async fetch(request: Request) {
        const url = new URL(request.url)

        const method = url.searchParams.get('method')
        switch (method) {
            case 'getEvents': {
                const options = await request.json<EventsQueryOptions | undefined>()
                return new Response(JSON.stringify(await this.getEvents(options)))
            }
            case 'pushEvent': {
                const eventDetail = await request.json<EventDetail>()
                const response = await this.pushEvent(eventDetail)
                return new Response(JSON.stringify(response))
            }
        }
        return new Response(`Methodnot found: ${method}`, { status: 404 })
    }
    async pushEvent(eventDetail: EventDetail): Promise<{ event: EventDetail }> {
        await this.state.storage.put(eventDetail.version, eventDetail)
        return {
            event: eventDetail,
        }
    }
    async getEvents(options?: EventsQueryOptions | undefined): Promise<{ events: EventDetail[] }> {
        const listOptions = mapOptions(options)
        const events = await this.state.storage.list<EventDetail>(listOptions)
        const asArray = Object.values(events).sort((a, b) => a.version - b.version)
        return {
            events: asArray,
        }
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
