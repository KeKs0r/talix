import { basename, ok } from 'common'
import { ulidFactory } from 'ulid-workers'
import { CommandHandler, Action } from 'castore-extended'
import { z } from 'zod'
import type { FileStorage } from 'file-storage'

import { createDocumentCommand } from './document-create-command'

const ulid = ulidFactory()

type UploadDocumentActionDependencies = {
    fileStorage: FileStorage
    createDocument: CommandHandler<typeof createDocumentCommand>
}

const uploadDocumentFromUrlActionSchema = z.object({
    fileName: z.string().optional(),
    url: z.string(),
})

export type UploadDocumentActionInput = z.infer<typeof uploadDocumentFromUrlActionSchema>

export const uploadDocumentFromUrlAction = new Action({
    actionId: 'DOCUMENTS:UPLOAD_DOCUMENT_FROM_URL_ACTION',
    async handler(
        input: UploadDocumentActionInput | unknown,
        { createDocument, fileStorage }: UploadDocumentActionDependencies
    ) {
        const { fileName, url } = uploadDocumentFromUrlActionSchema.parse(input)

        const name = fileName || basename(url)
        const id = ulid()
        // @TODO: [multitenant] add path prefix
        const key = `documents/${id}-${name}`

        const response = await fetch(url)
        if (response.status !== 200) {
            throw new DocumentNotFoundError(url)
        }
        const bodyStream = response.body
        ok(bodyStream, `Bodystream not available for ${url}`)
        const fileUrl = await fileStorage.put(key, bodyStream as any)

        const { documentId } = await createDocument({
            documentId: id,
            name,
            key: fileUrl.key,
        })

        return { documentId, key: fileUrl.key }
    },
})

class DocumentNotFoundError extends Error {
    url: string
    constructor(url: string) {
        super('Document could not be fetched')
        this.name = 'DocumentNotFoundError'
        this.url = url
    }
}
