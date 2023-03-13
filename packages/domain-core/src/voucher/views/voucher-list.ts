import { HttpAction } from '@chute/core'
import { Kysely } from 'kysely'

import { Database } from './voucher-projection'

export const voucherList = new HttpAction({
    actionId: 'voucher:list',
    httpPath: '/vouchers',
    httpMethod: 'GET',
    async handler(input, { kysely }: { kysely: Kysely<Database> }) {
        const res = await kysely.selectFrom('vouchers').select('data').execute()
        const duplicateVouchers = res.map((serialized) => JSON.parse(serialized.data))
        return duplicateVouchers
    },
})
