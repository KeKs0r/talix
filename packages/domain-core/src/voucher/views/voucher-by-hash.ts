import type { Kysely } from 'kysely'

import { VoucherAggregate } from '../voucher-aggregate'

import type { Database } from './voucher-projection'

export async function queryVouchersByDocumentHash(
    ky: Kysely<Database>,
    hash: string
): Promise<VoucherAggregate[]> {
    const res = await ky
        .selectFrom('vouchers')
        .select('data')
        .where('documentHash', '==', hash)
        .execute()

    const duplicateVouchers = res.map((serialized) => JSON.parse(serialized.data))
    return duplicateVouchers
}
