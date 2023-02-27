import { CFRuntimeContext } from '@chute/cf-runtime/src/runtime-context'
import { HttpAction } from '@chute/core'
import { diary } from 'diary'

const logger = diary('app:documents:list')

export const listDocumentActions = new HttpAction<
    'app:documents:list',
    unknown,
    any,
    CFRuntimeContext
>({
    actionId: 'app:documents:list',
    httpPath: '/documents',
    httpMethod: 'GET',
    handler: async (input: unknown, { DB }: { DB: D1Database }) => {
        const { results: documents } = await DB.prepare(`SELECT * FROM documents`).all()

        return { documents }
    },
})
