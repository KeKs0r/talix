import { BaseContext, EventAction } from '@chute/core'
import { Kysely } from 'kysely'

import { VoucherCreatedEventDetail, voucherCreatedEventType } from '../crud/voucher-created-event'
import { queryVouchersByDocumentHash } from '../views/voucher-by-hash'
import { Database } from '../views/voucher-projection'
import { VoucherEventStore } from '../voucher-eventstore'

import { duplicatesFoundCommand } from './voucher-dupicates-found-command'

export const checkDuplicateAction = new EventAction({
    actionId: 'voucher:check_duplicate',
    eventTrigger: voucherCreatedEventType.type,
    async handler(
        event: VoucherCreatedEventDetail,
        {
            voucherStore,
            ky,
            runCommand,
        }: BaseContext & {
            voucherStore: VoucherEventStore
            ky: Kysely<Database>
        }
    ) {
        const { aggregate } = await voucherStore.getExistingAggregate(event.aggregateId)
        if (aggregate.documentHash) {
            const duplicates = await queryVouchersByDocumentHash(ky, aggregate.documentHash)

            await runCommand(duplicatesFoundCommand, {
                didRunOnThis: true,
                duplicateVoucherIds: duplicates.map((a) => a.aggregateId),
                voucherId: event.aggregateId,
            })

            await Promise.all(
                duplicates.map((duplicate) =>
                    runCommand(duplicatesFoundCommand, {
                        didRunOnThis: false,
                        duplicateVoucherIds: [event.aggregateId],
                        voucherId: duplicate.aggregateId,
                    })
                )
            )
        }
    },
})
