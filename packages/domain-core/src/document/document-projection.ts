import { EventAction } from '@chute/core'
import type { Kysely } from 'kysely'
import { diary } from 'diary'

import type { DocumentEventStore } from './document-eventstore'
import { DocumentAggregate } from './document-aggregate'

interface Database {
    documents: DocumentAggregate
}

const logger = diary('document:projection')
export const documentProjection = new EventAction({
    actionId: 'document:projection',
    eventTrigger: 'document:*',
    async handler(
        event,
        {
            kysely,
            documentEventStore,
        }: { kysely: Kysely<Database>; documentEventStore: DocumentEventStore }
    ) {
        const { aggregate } = await documentEventStore.getExistingAggregate(event.aggregateId, {
            maxVersion: event.version,
        })
        logger.info('Aggregate %o', aggregate)
        if (event.version === 0) {
            const r = await kysely
                .insertInto('documents')
                .values(aggregate)
                .onConflict((oc) => oc.doNothing())
                .execute()
            logger.info('Insert result %o', r)
        } else {
            const r = await kysely
                .updateTable('documents')
                .set(aggregate)
                .where('aggregateId', '==', event.aggregateId)
                .where('version', '<', event.version)
                .execute()
            logger.info('Insert result %o', r)
        }
    },
})
