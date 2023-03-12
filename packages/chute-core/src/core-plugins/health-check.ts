import { BaseContext } from '../base-context'
import { Chute } from '../chute-app'
import { HttpAction } from '../http-action'
import { BaseRegistryMap } from '../registry'

type HealthCheckOptions = {
    path?: string
}
export function healthCheckPlugin<
    C extends BaseContext = BaseContext,
    R extends BaseRegistryMap<C> = BaseRegistryMap<C>
>(options?: HealthCheckOptions) {
    const { path = '/health-check' } = options || {}
    const healthCheckAction = new HttpAction({
        actionId: 'chute:core:health-check',
        httpPath: path,
        handler: () => {
            return { status: 'ok' }
        },
    })
    return (app: Chute<C, R>) => {
        return app.registerAction(healthCheckAction)
    }
}
