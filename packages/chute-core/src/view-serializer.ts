import { pick } from 'lodash-es'
import type { Aggregate } from '@castore/core'

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

export function makeSerializer<Agg extends Aggregate, Indexes extends keyof Agg = keyof Agg>(
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
