import { Message } from '@cloudflare/workers-types'
import { e } from 'vitest/dist/index-5aad25c1'

import { Bindings } from '../env.types'

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
export async function queue(batch: MessageBatch<MessageBody>, env: Bindings): Promise<void> {
    await Promise.all(
        batch.messages.map(async (message) => {
            console.log('Message', message)
            if (isProduceMessage(message)) {
                console.log('Starting fanout')
                await fanout(message, env)
            } else {
                console.log('IsConsumeMessage')
            }
        })
    )
}

function isProduceMessage(message: Message<MessageBody>): message is Message<ProduceBody> {
    return message.body.type === 'PRODUCE'
}

export async function fanout(message: Message<ProduceBody>, env: Bindings) {
    if (message.body.event.type === 'DOCUMENTS:DOCUMENT_CREATED') {
        const consumeMessage: ConsumeBody = {
            type: 'CONSUME',
            actionId: 'OCR:ANALYZE_CREATED_DOCUMENT_ACTION',
            event: message.body.event,
            sourceId: message.id,
        }
        console.log('fanout happening', consumeMessage)
        await env.EVENT_QUEUE.send(consumeMessage)
    } else {
        console.log('fanout not happening', message.body.event.type)
    }
}
