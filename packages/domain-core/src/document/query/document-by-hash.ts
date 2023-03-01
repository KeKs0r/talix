import type { Kysely } from 'kysely'

import { DocumentAggregate } from '../document-aggregate'

import type { Database } from './document-projection'

export async function queryDocumentByHash(
    ky: Kysely<Database>,
    hash: string
): Promise<DocumentAggregate | undefined> {
    const res = await ky
        .selectFrom('documents')
        .select('data')
        .where('contentHash', '==', hash)
        .limit(1)
        .execute()

    const json = res[0].data
    if (json) {
        return JSON.parse(json)
    }
}
