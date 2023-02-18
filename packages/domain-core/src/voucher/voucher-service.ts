import { Aggregate, Chute } from '@chute/core'

import { voucherEventStore } from './voucher-eventstore'
import { createVoucherCommand } from './voucher-create-command'
import { voucherCreatedEventType } from './voucher-created-event'

export const voucherAggregate: Aggregate = {
    name: 'VOUCHER',
    store: voucherEventStore,
    commands: [createVoucherCommand],
    events: [voucherCreatedEventType],
}

export function voucherService(app: Chute) {
    app.registerAggregate(voucherAggregate)
}
