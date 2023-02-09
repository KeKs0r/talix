import { createCloudflareRuntime } from './runtime/create-cloudflare-runtime'
import { DurableEntity } from './runtime/durable-entity'
import { telegramWebhook } from './telegram/telegram-webhook'

const app = createCloudflareRuntime()
telegramWebhook(app.hono)

export default app
export { DurableEntity }
