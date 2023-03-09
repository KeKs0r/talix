import type { Reducer, EventDetail } from '@castore/core'

import { VoucherAggregate } from './voucher-aggregate'
import { voucherCreatedEventType, VoucherCreatedPayload } from './crud/voucher-created-event'
import {
    voucherDuplicateFoundEventType,
    VoucherDuplicateFoundPayload,
} from './duplicate-check/voucher-duplicate-found-event'

type VoucherEventDetails = EventDetail<typeof voucherCreatedEventType>

export const voucherReducer: Reducer<VoucherAggregate, VoucherEventDetails> = (
    voucherAggregate,
    newEvent
) => {
    const { aggregateId, version, timestamp } = newEvent

    switch (newEvent.type) {
        case voucherCreatedEventType.type: {
            const { documentId, creditOrDebit, vatTaxType, voucherDate, documentHash } =
                newEvent.payload as VoucherCreatedPayload
            const voucher: VoucherAggregate = {
                aggregateId,
                version,
                createdAt: timestamp,
                status: 'DRAFT',
                documentId,
                documentHash,
                creditOrDebit,
                vatTaxType,
                voucherDate,
                items: [],
            }
            return voucher
        }
        case voucherDuplicateFoundEventType.type: {
            const { didRunOnThis, duplicateVoucherId } =
                newEvent.payload as VoucherDuplicateFoundPayload
            const updated: VoucherAggregate = {
                ...voucherAggregate,
                duplicates: {
                    ...voucherAggregate.duplicates,
                    didRun: voucherAggregate.duplicates?.didRun || didRunOnThis,
                    duplicates: Array.from(
                        new Set([
                            ...(voucherAggregate.duplicates?.duplicates || []),
                            duplicateVoucherId,
                        ])
                    ),
                },
            }
            return updated
        }

        default:
            console.warn('voucher-reducer', 'default case')
            return voucherAggregate
    }
}
