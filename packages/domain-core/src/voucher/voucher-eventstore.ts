import { RuntimeContext } from '@chute/cf-runtime'
import { EventStore } from '@chute/core'

import { voucherCreatedEventType } from './crud/voucher-created-event'
import { voucherReducer } from './voucher-reducer'

export const createVoucherEventStore = ({ emitter, storageAdapter }: RuntimeContext) =>
    new EventStore({
        eventStoreId: 'voucherStore',
        eventStoreEvents: [voucherCreatedEventType],
        reduce: voucherReducer,
        emitter,
        storageAdapter,
    })
export type VoucherEventStore = ReturnType<typeof createVoucherEventStore>
