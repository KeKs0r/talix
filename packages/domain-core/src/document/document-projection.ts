import { EventAction } from '@chute/core'
import type { Kysely } from 'kysely'
import { diary } from 'diary'
import { pick } from 'lodash-es'
import { Aggregate } from '@castore/core'

import type { DocumentEventStore } from './document-eventstore'
import { DocumentAggregate } from './document-aggregate'

interface Database {
    documents: SerializedDocument
}

const logger = diary('document:projection')

type SerializedDocument = {
    aggregateId: string
    version: number
    data: string

    contentHash: string
}
const serializeDocument = makeSerializer<DocumentAggregate>({
    hash: {
        fields: ['contentHash'],
    },
})

export const documentProjection = new EventAction({
    actionId: 'document:projection',
    eventTrigger: 'document:*',
    async handler(
        event,
        {
            kysely,
            documentEventStore,
            DB,
        }: { DB: D1Database; kysely: Kysely<Database>; documentEventStore: DocumentEventStore }
    ) {
        const { aggregate } = await documentEventStore.getExistingAggregate(event.aggregateId, {
            maxVersion: event.version,
        })

        logger.info('Aggregate %o', aggregate)
        const serialized = serializeDocument(aggregate)
        if (event.version === 1) {
            const [r] = await kysely
                .insertInto('documents')
                .values(serialized)
                .onConflict((oc) => oc.doNothing())
                .execute()
            logger.info('Insert result %o', r.numInsertedOrUpdatedRows)
        } else {
            const [r] = await kysely
                .updateTable('documents')
                .set(serialized)
                .where('aggregateId', '==', event.aggregateId)
                .where('version', '<', event.version)
                .execute()
            logger.info('Insert result %o', r.numUpdatedRows)
        }
    },
})

type SerializeOptions<Agg extends Aggregate, Indexes extends keyof Agg = keyof Agg> = Record<
    string,
    IndexDefinition<Agg, Indexes>
>
type IndexDefinition<Agg extends Aggregate, Indexes extends keyof Agg = keyof Agg> = {
    fields: Indexes[]
}
type SerializedAggregate<Agg extends Aggregate, Indexes extends keyof Agg> = {
    data: string
    aggregateId: string
    version: number
} & Pick<Agg, Indexes>

function makeSerializer<Agg extends Aggregate, Indexes extends keyof Agg = keyof Agg>(
    indexOptions: SerializeOptions<Agg, Indexes>
) {
    const extractedFields = Object.values(indexOptions).flatMap((i) => i.fields)
    return function serialize(a: Agg) {
        const indexes: Pick<Agg, Indexes> = pick(a, extractedFields)
        const result: SerializedAggregate<Agg, Indexes> = {
            ...indexes,
            aggregateId: a.aggregateId,
            version: a.version,
            data: JSON.stringify(a),
        }
        return result
    }
}
