import ok from 'tiny-invariant'
import { Action, error, ErrorResponse, Maybe, success, SuccessResponse } from '@chute/core'
import { z } from 'zod'
import { diary } from 'diary'
import { RuntimeContext } from '@chute/cf-runtime'
import { Kysely } from 'kysely'

import { basename } from '../../shared/basename'
import { createDocumentCommand } from '../command/document-create-command'
import { Database } from '../query/document-projection'
import { queryDocumentByHash } from '../query/document-by-hash'

const logger = diary('documents:upload-from-url')

type Success = { documentId: string; key: string }
type DocumentNotFoundError = { code: 'DocumentNotFound'; url: string }

type Response = Maybe<Success, DocumentNotFoundError>

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
        { runCommand, fileStorage, generateId, ky }: RuntimeContext & { ky: Kysely<Database> }
    ): Promise<Response> {
        const { fileName, url, hash, mimeType } = uploadDocumentFromUrlActionSchema.parse(input)

        const name = fileName || basename(url)
        const id = generateId()
        // @TODO: [multitenant] add path prefix
        const key = `documents/${id}-${name}`

        const response = await fetch(url)
        if (response.status !== 200) {
            return error<DocumentNotFoundError>({
                code: 'DocumentNotFound',
                url,
            })
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

        return success({ documentId: id, key: fileUrl.key })
    },
})
