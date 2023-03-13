import { AggregateService, Chute } from '@chute/core'
import { RuntimeContext } from '@chute/cf-runtime'

import { createVoucherEventStore } from './voucher-eventstore'
import { createVoucherCommand } from './crud/voucher-create-command'
import { voucherCreatedEventType } from './crud/voucher-created-event'
import { voucherProjection } from './views/voucher-projection'
import { voucherList } from './views/voucher-list'

export const voucherAggregate: AggregateService<RuntimeContext> = {
    name: 'voucher',
    storeFactory: createVoucherEventStore,
    commands: [createVoucherCommand],
    events: [voucherCreatedEventType],
}

export function voucherService<C extends RuntimeContext = RuntimeContext>(app: Chute<C>) {
    return app
        .registerAggregate(voucherAggregate)
        .registerAction(voucherProjection)
        .registerAction(voucherList)
}
