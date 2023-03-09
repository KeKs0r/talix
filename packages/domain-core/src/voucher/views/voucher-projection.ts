import { EventAction, makeSerializer } from '@chute/core'
import type { Kysely } from 'kysely'
import { diary } from 'diary'

import type { VoucherEventStore } from '../voucher-eventstore'
import { VoucherAggregate } from '../voucher-aggregate'

export interface Database {
    vouchers: SerializedVoucher
}

const logger = diary('voucher:projection')

type SerializedVoucher = {
    aggregateId: string
    version: number
    data: string
    documentHash?: string
}
const serializeVoucher = makeSerializer<VoucherAggregate>({
    hash: {
        fields: ['documentHash'],
    },
})

export const voucherProjection = new EventAction({
    actionId: 'voucher:projection',
    eventTrigger: 'voucher:*',
    async handler(
        event,
        { kysely, voucherStore }: { kysely: Kysely<Database>; voucherStore: VoucherEventStore }
    ) {
        const { aggregate } = await voucherStore.getExistingAggregate(event.aggregateId, {
            maxVersion: event.version,
        })

        logger.info('Aggregate %o', aggregate)
        const serialized: SerializedVoucher = serializeVoucher(aggregate)
        if (event.version === 1) {
            const [r] = await kysely
                .insertInto('vouchers')
                .values(serialized)
                .onConflict((oc) => oc.doNothing())
                .execute()
            logger.info('Insert result %o', r.numInsertedOrUpdatedRows)
        } else {
            const [r] = await kysely
                .updateTable('vouchers')
                .set(serialized)
                .where('aggregateId', '==', event.aggregateId)
                .where('version', '<', event.version)
                .execute()
            logger.info('Insert result %o', r.numUpdatedRows)
        }
    },
})
