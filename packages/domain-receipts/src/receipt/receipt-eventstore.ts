import { EventStore } from '@castore/core'

import { receiptCreatedEventType } from './receipt-created-event'
import { receiptReducer } from './receipt-reducer'

export const receiptEventStore = new EventStore({
    eventStoreId: 'RECEIPTS',
    eventStoreEvents: [receiptCreatedEventType],
    reduce: receiptReducer,
})
