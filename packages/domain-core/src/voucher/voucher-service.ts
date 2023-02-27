import { AggregateService, Chute } from '@chute/core'
import { RuntimeContext } from '@chute/cf-runtime'

import { createVoucherEventStore } from './voucher-eventstore'
import { createVoucherCommand } from './voucher-create-command'
import { voucherCreatedEventType } from './voucher-created-event'

export const voucherAggregate: AggregateService<RuntimeContext> = {
    name: 'voucher',
    storeFactory: createVoucherEventStore,
    commands: [createVoucherCommand],
    events: [voucherCreatedEventType],
}

export function voucherService<C extends RuntimeContext = RuntimeContext>(app: Chute<C>) {
    app.registerAggregate(voucherAggregate)
}
