import { Chute, HttpAction } from '@chute/core'
import { describe, expect, it, vi } from 'vitest'
import Emittery from 'emittery'

import { createCloudflareRuntime } from '../create-cloudflare-runtime'
import { CFRuntimeContext } from '../runtime-context'

describe('Scoped Container', () => {
    it('After creating multiple scopes, events are only emitted once', async () => {
        const sendSpy = vi.fn()
        const EVENT_QUEUE = {
            // send: sendSpy,
            send: sendSpy,
        }
        const app = new Chute<CFRuntimeContext>()
        app.registerAction(
            new HttpAction<'mock', unknown, any, CFRuntimeContext>({
                actionId: 'mock',
                handler: async (input: unknown, { emitter }: { emitter: Emittery }) => {
                    expect(emitter).toBeTruthy()
                    console.log('Handler', emitter.listenerCount())
                    await emitter.emit('test')
                    return { status: 'ok' }
                },
                httpPath: '/hello',
                httpMethod: 'GET',
            })
        )

        const runtime = createCloudflareRuntime(app)
        const execCtx = new ExecutionContext()

        const r = await runtime.fetch(
            new Request('https://host.com/hello'),
            { EVENT_QUEUE },
            execCtx
        )
        const json = await r.json()
        expect(json).toHaveProperty('status', 'ok')

        expect(sendSpy).toHaveBeenCalledTimes(1)

        await runtime.fetch(new Request('https://host.com/hello'), { EVENT_QUEUE }, execCtx)
        expect(sendSpy).toHaveBeenCalledTimes(2)

        await runtime.fetch(new Request('https://host.com/hello'), { EVENT_QUEUE }, execCtx)
        expect(sendSpy).toHaveBeenCalledTimes(3)
    })
})
