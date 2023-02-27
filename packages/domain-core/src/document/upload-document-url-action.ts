import ok from 'tiny-invariant'
import { Action } from '@chute/core'
import { z } from 'zod'
import { diary } from 'diary'
import { RuntimeContext } from '@chute/cf-runtime'

import { basename } from '../shared/basename'

import { createDocumentCommand } from './document-create-command'

const logger = diary('documents:upload-from-url')

const uploadDocumentFromUrlActionSchema = z.object({
    mimeType: z.string(),
    fileName: z.string().optional(),
    hash: z.string().optional(),
    url: z.string(),
})

export type UploadDocumentActionInput = z.infer<typeof uploadDocumentFromUrlActionSchema>

export const uploadDocumentFromUrlAction = new Action({
    actionId: 'documents:upload-from-url',
    async handler(
        input: UploadDocumentActionInput,
        { runCommand, fileStorage, generateId }: RuntimeContext
    ) {
        const { fileName, url, hash, mimeType } = uploadDocumentFromUrlActionSchema.parse(input)

        const name = fileName || basename(url)
        const id = generateId()
        // @TODO: [multitenant] add path prefix
        const key = `documents/${id}-${name}`

        const response = await fetch(url)
        if (response.status !== 200) {
            throw new DocumentNotFoundError(url)
        }
        const bodyStream = response.body
        ok(bodyStream, `Bodystream not available for ${url}`)
        ok(hash, `Hash not available for ${url}`)
        const fileUrl = await fileStorage.put(key, bodyStream as any, {
            httpMetadata: {
                contentType: mimeType,
            },
        })

        await runCommand(createDocumentCommand, {
            aggregateId: id,
            name,
            key: fileUrl.key,
            contentHash: hash,
        })

        return { documentId: id, key: fileUrl.key }
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
