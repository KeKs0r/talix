import { EventStore } from 'castore-extended'

import { emitter } from '../shared/emitter'

import { voucherCreatedEventType } from './voucher-created-event'
import { voucherReducer } from './voucher-reducer'

export const voucherEventStore = new EventStore({
    eventStoreId: 'VOUCHERS',
    eventStoreEvents: [voucherCreatedEventType],
    reduce: voucherReducer,
    emitter,
})
