import { Chute } from '../chute-app'
import { HttpAction } from '../http-action'

type HealthCheckOptions = {
    path?: string
}
export function healthCheckPlugin(options?: HealthCheckOptions) {
    const { path = '/health-check' } = options || {}
    const healthCheckAction = new HttpAction({
        actionId: 'chute:core:health-check',
        httpPath: path,
        handler: () => {
            return { status: 'ok' }
        },
    })
    return (app: Chute) => {
        app.registerAction(healthCheckAction)
    }
}
