import type { Reducer, EventDetail, $Contravariant } from '@castore/core'

import { VoucherAggregate } from './voucher-aggregate'
import { voucherCreatedEventType, VoucherCreatedPayload } from './voucher-created-event'

type VoucherEventDetails = EventDetail<typeof voucherCreatedEventType>

export const voucherReducer: Reducer<VoucherAggregate, VoucherEventDetails> = (
    voucherAggregate,
    newEvent
) => {
    const { aggregateId, version, timestamp } = newEvent

    switch (newEvent.type) {
        case voucherCreatedEventType.type: {
            const { documentId, creditOrDebit, vatTaxType, voucherDate } =
                newEvent.payload as VoucherCreatedPayload
            const voucher: VoucherAggregate = {
                aggregateId,
                version,
                createdAt: timestamp,
                status: 'DRAFT',
                documentId,
                creditOrDebit,
                vatTaxType,
                voucherDate,
                items: [],
            }
            return voucher
        }

        default:
            console.log('default case')
            return voucherAggregate
    }
}
