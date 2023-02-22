import { Message, MessageBatch, ExecutionContext } from '@cloudflare/workers-types'
import { AwilixContainer } from 'awilix'
import { Action, Chute } from '@chute/core'
import { diary } from 'diary'

import { Bindings } from './base-env.types'
import { createScope } from './scope'
import { CFRuntimeContext } from './runtime-context'

const logger = diary('chute:cf:queue')

export function createQueue(app: Chute<CFRuntimeContext>) {
    return async function processQueue(
        batch: MessageBatch<MessageBody>,
        env: Bindings,
        ctx: ExecutionContext
    ): Promise<void> {
        const scope = createScope(app, env, ctx)
        await Promise.all(
            batch.messages.map(async (message) => {
                logger.info('Message %o', message)
                if (isProduceMessage(message)) {
                    logger.info('Starting fanout')
                    await fanout(message, app, scope)
                } else if (isConsumeMessage(message)) {
                    logger.info('IsConsumeMessage')
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

export async function fanout(
    message: Message<ProduceBody>,
    app: Chute,
    container: AwilixContainer<CFRuntimeContext>
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
        logger.info('fanout not happening for', message.body.event.type)
        logger.info('only listening to', Object.keys(app.eventMap))
    }
}

export async function handleConsume(
    message: Message<ConsumeBody>,
    app: Chute,
    scope: AwilixContainer<CFRuntimeContext>
) {
    const { actionId, event } = message.body
    const action = app.container.resolve(actionId)
    if (action instanceof Action) {
        await app.runAction(action, event, scope)
    } else {
        throw Error(`Could not find action: ${actionId}. Found ${typeof action}`)
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
