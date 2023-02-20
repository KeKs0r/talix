import { enable } from 'diary'

import { createCloudflareRuntime } from './runtime/create-cloudflare-runtime'
import { DurableEntity } from './runtime/durable-entity'
import { makeApp } from './app'

enable('*')

const app = makeApp()
const runtime = createCloudflareRuntime(app)

export default runtime
export { DurableEntity }
