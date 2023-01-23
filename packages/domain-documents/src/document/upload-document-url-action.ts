import assert from 'assert'
import { basename } from 'path'

import type { CommandHandler } from 'castore-extended'
import { z } from 'zod'
import type { FileStorage } from 'r2-file-storage'

import { createDocumentCommand } from './document-create-command'

type UploadDocumentActionDependencies = {
    fileStorage: FileStorage
    createDocument: CommandHandler<typeof createDocumentCommand>
    generateId: () => string
}

const uploadDocumentFromUrlActionSchema = z.object({
    fileName: z.string().optional(),
    url: z.string(),
})

type UploadDocumentActionInput = z.infer<typeof uploadDocumentFromUrlActionSchema>

/**
 * @dept: there is not yet an API for Actions, will evolve later
 */
export function createUploadDocumentFromUrlAction(deps: UploadDocumentActionDependencies) {
    const { createDocument, fileStorage, generateId } = deps

    return async function uploadDocumentFromUrlAction(input: UploadDocumentActionInput) {
        const { fileName, url } = uploadDocumentFromUrlActionSchema.parse(input)

        const name = fileName || basename(url)
        const id = generateId()
        // @TODO: [multitenant] add path prefix
        const key = `${id}-${name}`

        const response = await fetch(url)
        if (response.status !== 200) {
            throw new DocumentNotFoundError(url)
        }
        const bodyStream = response.body
        assert(bodyStream, `Bodystream not available for ${url}`)
        const fileUrl = await fileStorage.put(key, bodyStream)

        const { documentId } = await createDocument({
            documentId: id,
            name,
            key: fileUrl.key,
        })

        return { documentId, key: fileUrl.key }
    }
}

class DocumentNotFoundError extends Error {
    url: string
    constructor(url: string) {
        super('Document could not be fetched')
        this.name = 'DocumentNotFoundError'
        this.url = url
    }
}
