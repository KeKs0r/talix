import type { Opts, Telegram } from '../types/typegram'
import { compactOptions } from '../helpers/compact'

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
        return {} as any
        // if (!token) {
        //     throw new TelegramError({
        //         error_code: 401,
        //         description: 'Bot Token is required',
        //     })
        // }

        // debug('HTTP call', method, payload)

        // const config: RequestInit = includesMedia(payload)
        //     ? await buildFormDataConfig({ method, ...payload }, options.attachmentAgent)
        //     : await buildJSONConfig(payload)
        // const apiUrl = new URL(
        //     `./${options.apiMode}${token}${options.testEnv ? '/test' : ''}/${method}`,
        //     options.apiRoot
        // )
        // config.agent = options.agent
        // config.signal = signal
        // config.timeout = 500_000 // ms
        // const res = await fetch(apiUrl, config).catch(redactToken)
        // if (res.status >= 500) {
        //     const errorPayload = {
        //         error_code: res.status,
        //         description: res.statusText,
        //     }
        //     throw new TelegramError(errorPayload, { method, payload })
        // }
        // const data = await res.json()
        // if (!data.ok) {
        //     debug('API call failed', data)
        //     throw new TelegramError(data, { method, payload })
        // }
        // return data.result
    }
}
