import { EventStore } from 'castore-extended'

import { receiptCreatedEventType } from './receipt-created-event'
import { receiptReducer } from './receipt-reducer'

export const receiptEventStore = new EventStore({
    eventStoreId: 'RECEIPTS',
    eventStoreEvents: [receiptCreatedEventType],
    reduce: receiptReducer,
})
