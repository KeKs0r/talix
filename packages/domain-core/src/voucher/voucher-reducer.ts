import type { Reducer } from '@castore/core'

import { VoucherAggregate } from './voucher-aggregate'
import { VoucherCreatedEventTypeDetail, voucherCreatedEventType } from './voucher-created-event'

type VoucherEventDetails = VoucherCreatedEventTypeDetail

export const voucherReducer: Reducer<VoucherAggregate, VoucherEventDetails> = (
    voucherAggregate,
    newEvent: VoucherEventDetails
) => {
    const { aggregateId, version, timestamp } = newEvent

    switch (newEvent.type) {
        case voucherCreatedEventType.type: {
            const { documentId } = newEvent.payload
            const voucher: VoucherAggregate = {
                aggregateId,
                version,
                createdAt: timestamp,
                status: 'DRAFT',
                documentId,
                items: [],
            }
            return voucher
        }

        default:
            console.log('default case')
            return voucherAggregate
    }
}
