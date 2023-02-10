import d from 'debug'
import pTimeout from 'p-timeout'

import * as tg from './core/types/typegram'
import { Composer } from './composer'
import Context from './context'
import Telegram from './telegram'
import { compactOptions } from './core/helpers/compact'
import type { ApiClientOptions } from './core/network/client'

const debug = d('telegraf:main')

function always<T>(x: T) {
    return () => x
}

const anoop = always(Promise.resolve())

export interface TelegrafOptions<TContext extends Context> {
    contextType: new (...args: ConstructorParameters<typeof Context>) => TContext
    handlerTimeout: number
    telegram: Partial<ApiClientOptions>
}

const DEFAULT_OPTIONS: TelegrafOptions<Context> = {
    telegram: {},
    handlerTimeout: 90_000, // 90s in ms
    contextType: Context,
}

export class Telegraf<C extends Context = Context> extends Composer<C> {
    private readonly options: TelegrafOptions<C>
    public telegram: Telegram
    public botInfo?: tg.UserFromGetMe
    readonly context: Partial<C> = {}
    constructor(token: string, options?: Partial<TelegrafOptions<C>>) {
        super()
        // @ts-expect-error Trust me, TS
        this.options = {
            ...DEFAULT_OPTIONS,
            ...compactOptions(options),
        }
        this.telegram = new Telegram(token, this.options.telegram)
        debug('Created a `Telegraf` instance')
    }

    private get token() {
        return this.telegram.token
    }

    private botInfoCall?: Promise<tg.UserFromGetMe>
    async handleUpdate(update: tg.Update) {
        this.botInfo ??=
            (debug('Update %d is waiting for `botInfo` to be initialized', update.update_id),
            await (this.botInfoCall ??= this.telegram.getMe()))
        debug('Processing update', update.update_id)
        const tg = new Telegram(this.token, this.telegram.options)
        const TelegrafContext = this.options.contextType
        const ctx = new TelegrafContext(update, tg, this.botInfo)
        Object.assign(ctx, this.context)
        try {
            await pTimeout(Promise.resolve(this.middleware()(ctx, anoop)), {
                milliseconds: this.options.handlerTimeout,
            })
        } catch (err) {
            console.error('Unhandled error while processing', ctx.update)
            throw err
        } finally {
            //   if (webhookResponse?.writableEnded === false) {
            //     webhookResponse.end()
            //   }
            debug('Finished processing update', update.update_id)
        }
    }
}
