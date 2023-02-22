import { enable } from 'diary'
import { createCloudflareRuntime, DurableEntity } from '@chute/cf-runtime'

import { makeApp } from './app'

enable('*')

const app = makeApp()
const runtime = createCloudflareRuntime(app)

export default runtime
export { DurableEntity }
