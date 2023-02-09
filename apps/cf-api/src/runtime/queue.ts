import { Message } from '@cloudflare/workers-types'
import { Action, Service } from 'castore-extended'

import { Bindings } from '../env.types'

import { bindServices, getActionsById, getEventMap, makeDependencies } from './util'

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

export function createQueue(services: Service[]) {
    const eventMap = getEventMap(services)
    const actionsById = getActionsById(services)
    return async function processQueue(
        batch: MessageBatch<MessageBody>,
        env: Bindings
    ): Promise<void> {
        bindServices(services, env)
        await Promise.all(
            batch.messages.map(async (message) => {
                console.log('Message', message)
                if (isProduceMessage(message)) {
                    console.log('Starting fanout')
                    await fanout(message, eventMap, env)
                } else if (isConsumeMessage(message)) {
                    console.log('IsConsumeMessage')
                    await handleConsume(message, actionsById, env)
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
    eventMap: Record<string, string[]>,
    env: Bindings
) {
    const targets = eventMap[message.body.event.type]
    if (targets) {
        await Promise.all(
            targets.map((actionId) => {
                const consumeMessage: ConsumeBody = {
                    type: 'CONSUME',
                    actionId,
                    event: message.body.event,
                    sourceId: message.id,
                }
                return env.EVENT_QUEUE.send(consumeMessage)
            })
        )
    } else {
        console.log('fanout not happening for', message.body.event.type)
        console.log('only listening to', Object.keys(eventMap))
    }
}

export async function handleConsume(
    message: Message<ConsumeBody>,
    actionsById: Record<string, Action>,
    env: Bindings
) {
    const { actionId, event } = message.body
    const action = actionsById[actionId]
    if (action) {
        await action.handler(event, makeDependencies(env))
    } else {
        throw Error(`Could not find action: ${actionId}`)
    }
}
