import { HttpAction } from '@chute/core'
// import { diary } from 'diary'

import { CFRuntimeContext } from '../runtime-context'

// const logger = diary('cf:runtime:db-check')

export const dbCheckAction = new HttpAction<'chute:cf:db-check', unknown, any, CFRuntimeContext>({
    actionId: 'chute:cf:db-check',
    httpPath: '/check/db',
    httpMethod: 'GET',
    handler: async (input: unknown, { DB }: { DB: D1Database }) => {
        const { results: tables } = await DB.prepare(tablesQuery).all()

        const tableNames = tables?.map((r) => (r as { name: string }).name)
        if (tableNames?.includes('d1_migrations')) {
            const { results: migrations } = await DB.prepare(migrationsQuery).all()
            return {
                tables,
                migrations,
            }
        }
        return { tables }
    },
})

const tablesQuery = `
SELECT
    name
FROM
    sqlite_schema
WHERE
    type = 'table'
ORDER BY
    name;
`
const migrationsQuery = `
SELECT *
FROM d1_migrations
`
