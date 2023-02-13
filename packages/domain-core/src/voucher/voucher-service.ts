import { Service } from '@chute/core'

import { voucherEventStore } from './voucher-eventstore'
import { createVoucherCommand } from './voucher-create-command'
import { voucherCreatedEventType } from './voucher-created-event'

export const voucherService: Service = {
    name: 'VOUCHER',
    store: voucherEventStore,
    actions: [],
    commands: [createVoucherCommand],
    events: [voucherCreatedEventType],
}
