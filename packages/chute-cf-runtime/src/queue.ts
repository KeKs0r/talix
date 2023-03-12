import { Message, MessageBatch, ExecutionContext } from '@cloudflare/workers-types'
import { AwilixContainer } from 'awilix'
import { Action, BaseRegistryMap, Chute, matchEventAction } from '@chute/core'
import { diary } from 'diary'

import { Bindings } from './base-env.types'
import { createScope } from './scope'
import { CFRuntimeContext } from './runtime-context'

const logger = diary('chute:cf:queue')

export function createQueue<
    C extends CFRuntimeContext = CFRuntimeContext,
    R extends BaseRegistryMap<C> = BaseRegistryMap<C>
>(app: Chute<C, R>) {
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
                    await fanout(message, app, scope)
                } else if (isConsumeMessage(message)) {
                    await handleConsume(message, app, scope)
                } else {
                    throw new MessageTypeNotFound(
                        `Received a message I dont know how to handle`,
                        message
                    )
                }
            })
        )
        ctx.waitUntil(scope.dispose())
    }
}

export async function fanout<
    C extends CFRuntimeContext = CFRuntimeContext,
    R extends BaseRegistryMap<C> = BaseRegistryMap<C>
>(message: Message<ProduceBody>, app: Chute<C, R>, scope: AwilixContainer<C>) {
    const targets = matchEventAction(app, message.body.event.type)
    if (targets.length) {
        const eventQueue = scope.resolve('EVENT_QUEUE')
        await Promise.all(
            targets.map((action) => {
                const consumeMessage: ConsumeBody = {
                    type: 'CONSUME',
                    actionId: action.actionId,
                    event: message.body.event,
                    sourceId: message.id,
                }
                return eventQueue.send(consumeMessage)
            })
        )
    } else {
        logger.info('fanout not happening for', message.body.event.type)
        // logger.info('only listening to', Object.keys(app.actions))
    }
}

export async function handleConsume<
    C extends CFRuntimeContext = CFRuntimeContext,
    R extends BaseRegistryMap<C> = BaseRegistryMap<C>
>(message: Message<ConsumeBody>, app: Chute<C, R>, scope: AwilixContainer<C>) {
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
