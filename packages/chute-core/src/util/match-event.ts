import { BaseContext } from '../base-context'
import type { Chute } from '../chute-app'
import { EventAction, isEventAction } from '../event-action'
import { BaseRegistryMap } from '../registry'

export function matchEventAction<
    C extends BaseContext = BaseContext,
    R extends BaseRegistryMap<C> = BaseRegistryMap<C>
>(app: Chute<C, R>, eventName: string): EventAction[] {
    const eventActions = Object.values(app.actions).filter(isEventAction)
    const matched = eventActions.filter((action) => {
        return matchName(eventName, action.eventTrigger)
    })
    return matched
}

/**
 * Mainly taken from
 * https://github.com/maraisr/diary/blob/main/src/index.ts
 */
const to_reg_exp = (x: string) => new RegExp(x.replace(/\*/g, '.*') + '$')
export function matchName(event: string, listener: string) {
    const m = listener.split(/[\s,]+/).map(to_reg_exp)
    for (let len = m.length; len--; ) {
        if (m[len].test(event)) return true
    }
    return false
}
