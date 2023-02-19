import { createCloudflareRuntime } from './runtime/create-cloudflare-runtime'
import { DurableEntity } from './runtime/durable-entity'
import { telegramWebhook } from './telegram/telegram-webhook'
import { chute } from './app'

const app = createCloudflareRuntime(chute)
telegramWebhook(app.hono)

export default app
export { DurableEntity }
