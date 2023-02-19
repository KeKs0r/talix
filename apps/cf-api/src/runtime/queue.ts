import { Message } from '@cloudflare/workers-types'
import { AwilixContainer } from 'awilix'
import { Action, Chute } from '@chute/core'

import { Bindings } from '../env.types'

import { createScope } from './util'

/**
 * I am too lazy to implement multiple queues so ONE QUEUE to rule them all
 */

export type ProduceBody = {
    type: 'PRODUCE'
    event: any
}

export type ConsumeBody = {
    type: 'CONSUME'
    actionId: string
    sourceId: string
    event: any
}
type MessageBody = ProduceBody | ConsumeBody

export function createQueue(app: Chute) {
    return async function processQueue(
        batch: MessageBatch<MessageBody>,
        env: Bindings
    ): Promise<void> {
        const scope = createScope(app.container, env)
        await Promise.all(
            batch.messages.map(async (message) => {
                console.log('Message', message)
                if (isProduceMessage(message)) {
                    console.log('Starting fanout')
                    await fanout(message, app, scope)
                } else if (isConsumeMessage(message)) {
                    console.log('IsConsumeMessage')
                    await handleConsume(message, app, scope)
                } else {
                    throw new MessageTypeNotFound(
                        `Received a message I dont know how to handle`,
                        message
                    )
                }
            })
        )
    }
}

class MessageTypeNotFound extends Error {
    event: any
    constructor(message: string, event: any) {
        super(message)
        this.event = event
    }
}

function isProduceMessage(message: Message<MessageBody>): message is Message<ProduceBody> {
    return message.body.type === 'PRODUCE'
}

function isConsumeMessage(message: Message<MessageBody>): message is Message<ConsumeBody> {
    return message.body.type === 'CONSUME'
}

export async function fanout(
    message: Message<ProduceBody>,
    app: Chute,
    container: AwilixContainer
) {
    const targets = app.eventMap[message.body.event.type]
    if (targets) {
        const eventQueue = container.resolve('EVENT_QUEUE')
        await Promise.all(
            targets.map((actionId) => {
                const consumeMessage: ConsumeBody = {
                    type: 'CONSUME',
                    actionId,
                    event: message.body.event,
                    sourceId: message.id,
                }
                return eventQueue.send(consumeMessage)
            })
        )
    } else {
        console.log('fanout not happening for', message.body.event.type)
        console.log('only listening to', Object.keys(app.eventMap))
    }
}

export async function handleConsume(
    message: Message<ConsumeBody>,
    app: Chute,
    container: AwilixContainer
) {
    const { actionId, event } = message.body
    const action = app.actions[actionId]
    if (action) {
        await action.handler(event, container)
    } else {
        throw Error(`Could not find action: ${actionId}`)
    }
}
