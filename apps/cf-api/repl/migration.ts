import { Kysely, sql, SqliteDialect } from 'kysely'

main()
async function main() {
    const db = new Kysely<any>({
        dialect: new SqliteDialect({} as any),
    })
    const q = db.schema
        .createTable('test')
        .addColumn('id', 'varchar(26)', (col) => col.primaryKey().unique())
        .addColumn('name', 'varchar(255)')
        .addColumn('key', 'varchar(255)')
        .addColumn('status', 'varchar(80)')
        .addColumn('hash', 'varchar(80)')
        .addColumn('createdAt', 'datetime')
        .compile()

    /**
 *     name: string
    key: string
    status: 'CREATED' | 'ANALYZED'
    hash: string
    createdAt: DateTimeString
 */

    console.log(q.sql)
}
