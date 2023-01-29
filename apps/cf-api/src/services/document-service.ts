import { uploadDocumentFromUrlAction } from 'domain-core'
import { R2FileStorage } from 'file-storage'
import { Hono } from 'hono'
import { ulidFactory } from 'ulid-workers'
import { createDocumentCommand } from 'domain-core'

import { Env } from '../env.types'

import { makeCommandConsumer } from './make-command-consumer'

const ulid = ulidFactory()

export function makeDocumentRoutes(app: Hono<Env>) {
    app.post('/documents/upload-from-url', async (c) => {
        const createDocument = makeCommandConsumer(createDocumentCommand, c.env.DOCUMENT_ENTITY)
        console.log('/documents/upload-from-url')
        const body = await c.req.json()

        console.log('Input body', body)

        const fileStorage = new R2FileStorage(c.env.DOCUMENTS_BUCKET)
        const result = await uploadDocumentFromUrlAction.handler(body, {
            createDocument,
            fileStorage,
            generateId: ulid,
        })
        c.json(result)
    })
}
