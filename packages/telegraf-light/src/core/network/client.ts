import debug from 'debug'

import type { Opts, Telegram } from '../types/typegram'
import { compactOptions } from '../helpers/compact'

import TelegramError from './error'

const d = debug('telegraf:client')

export interface ApiClientOptions {
    apiRoot: string
    /**
     * @default 'bot'
     * @see https://github.com/tdlight-team/tdlight-telegram-bot-api#user-mode
     */
    apiMode: 'bot' | 'user'
    webhookReply: boolean
    testEnv: boolean
}

const DEFAULT_OPTIONS: ApiClientOptions = {
    apiRoot: 'https://api.telegram.org',
    apiMode: 'bot',
    webhookReply: true,
    testEnv: false,
}

export class ApiClient {
    readonly options: ApiClientOptions

    constructor(readonly token: string, options?: Partial<ApiClientOptions>) {
        this.options = {
            ...DEFAULT_OPTIONS,
            ...compactOptions(options),
        }
    }

    /**
     * If set to `true`, first _eligible_ call will avoid performing a POST request.
     * Note that such a call:
     * 1. cannot report errors or return meaningful values,
     * 2. resolves before bot API has a chance to process it,
     * 3. prematurely confirms the update as processed.
     *
     * https://core.telegram.org/bots/faq#how-can-i-make-requests-in-response-to-updates
     * https://github.com/telegraf/telegraf/pull/1250
     */
    set webhookReply(enable: boolean) {
        this.options.webhookReply = enable
    }

    get webhookReply() {
        return this.options.webhookReply
    }

    async callApi<M extends keyof Telegram>(
        method: M,
        payload: Opts<M>
        // { signal }: ApiClient.CallApiOptions = {}
    ): Promise<ReturnType<Telegram[M]>> {
        const { token, options } = this

        if (!token) {
            throw new TelegramError({
                error_code: 401,
                description: 'Bot Token is required',
            })
        }

        d('HTTP call', method, payload)

        // const config: RequestInit = includesMedia(payload)
        //     ? await buildFormDataConfig({ method, ...payload }, options.attachmentAgent)
        //     : await buildJSONConfig(payload)
        const config = buildJSONConfig(payload)

        const apiUrl = new URL(
            `./${options.apiMode}${token}${options.testEnv ? '/test' : ''}/${method}`,
            options.apiRoot
        )

        // config.signal = signal
        // config.timeout = 500_000 // ms
        console.log('apiUrl', apiUrl)
        console.log('Config', config)
        const res = await fetch(apiUrl, config).catch(redactToken)
        if (res.status >= 500) {
            const errorPayload = {
                error_code: res.status,
                description: res.statusText,
            }
            throw new TelegramError(errorPayload, { method, payload })
        }
        const data = await res.json<TelegramApiResponse<ReturnType<Telegram[M]>>>()
        console.log('data', data)
        if (!data.ok) {
            d('API call failed', data)
            throw new TelegramError(data, { method, payload })
        }
        return data.result
    }
}

function replacer(_: unknown, value: unknown) {
    if (value == null) return undefined
    return value
}

function buildJSONConfig(payload: unknown): RequestInit<RequestInitCfProperties> {
    return {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload, replacer),
    }
}

function redactToken(error: Error): never {
    error.message = error.message.replace(/\/(bot|user)(\d+):[^/]+\//, '/$1$2:[REDACTED]/')
    throw error
}

type SuccessResponse<T> = {
    ok: true
    result: T
}

type ErrorResponse = {
    ok: false
    error_code: number
    description: string
    parameters?: any //ResponseParameters
}
type TelegramApiResponse<T> = SuccessResponse<T> | ErrorResponse
