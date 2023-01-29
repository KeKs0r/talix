import { ok } from 'common'
import { uploadDocumentFromUrlAction, CreateDocumentOutput, CreateDocumentInput } from 'domain-core'
import { createFileStorage } from 'file-storage'
import { Hono } from 'hono'
import { ulidFactory } from 'ulid-workers'

import { Env } from '../env.types'

const ulid = ulidFactory()

export function makeDocumentRoutes(app: Hono<Env>) {
    app.post('/documents/upload-from-url', async (c) => {
        console.log('/documents/upload-from-url')
        const body = await c.req.json()

        console.log('Input body', body)

        async function createDocument(input: CreateDocumentInput) {
            console.log('CreateDocumentInput', input)
            const { documentId } = input
            let id = c.env.DOCUMENT_ENTITY.idFromName(documentId)
            const stub = c.env.DOCUMENT_ENTITY.get(id)

            const command = encodeURIComponent('DOCUMENTS:CREATE_DOCUMENT')
            const req = new Request(new URL(`https://durableobject?command=${command}`), {
                method: 'POST',
                body: JSON.stringify(input),
            })
            console.log(stub.id)
            const entityResponse = await stub.fetch(req)
            ok(entityResponse.status === 200, `Entity response status: ${entityResponse.status}`)
            const output = await entityResponse.json<CreateDocumentOutput>()
            return output
        }
        const fileStorage = createFileStorage(c.env.DOCUMENTS_BUCKET) as any
        const result = await uploadDocumentFromUrlAction.handler(body, {
            createDocument,
            fileStorage,
            generateId: ulid,
        })
        c.json(result)
    })
}
