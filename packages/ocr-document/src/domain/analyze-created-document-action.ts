import ok from 'tiny-invariant'
import { DateString, EventAction } from '@chute/core'
import { diary } from 'diary'
import {
    documentCreatedEventType,
    DocumentCreatedEventTypeDetail,
    DocumentCreatedPayload,
    createVoucherCommand,
    CreateVoucherInput,
    createDateString,
} from 'domain-core'

import { ExpenseSuccessResponse, isSuccessResponse } from '../document-ai/model/document-schema'
import { getDateEntity } from '../document-ai/model/expense-schema'
import { arrayBufferToBase64 } from '../document-ai/fetch-file'

import { OcrDocumentContext } from './ocr-document-context'

const logger = diary('ocr:analyze-created-document')

export const analyzeCreatedDocumentAction = new EventAction<'ocr:analyse-uploaded-document'>({
    actionId: 'ocr:analyse-uploaded-document',
    eventTrigger: documentCreatedEventType.type,
    handler: async (
        event: DocumentCreatedEventTypeDetail,
        { fileStorage, runCommand, documentAnalyzer }: OcrDocumentContext
    ) => {
        const documentId = event.aggregateId
        const { key, contentHash } = event.payload as DocumentCreatedPayload
        const file = await fileStorage.get(key)
        ok(file, `Could not find file with key ${key}`)
        const buffer = await file.arrayBuffer()
        const base64 = arrayBufferToBase64(buffer)
        const type = file.httpMetadata?.contentType
        ok(type, `Could not find content type for file with key ${key}`)

        const prediction = await documentAnalyzer.analyzeExpense({ base64, type })

        if (isSuccessResponse(prediction)) {
            const voucherDate = getVoucherDate(prediction)

            const input: CreateVoucherInput = {
                creditOrDebit: 'DEBIT',
                vatTaxType: 'EU',
                documentId: documentId,
                voucherDate,
                documentHash: contentHash,
            }
            await runCommand(createVoucherCommand, input)
        } else {
            logger.warn('Document analysis failed', { documentId })
        }
    },
})

function getVoucherDate(prediction: ExpenseSuccessResponse): DateString | undefined {
    const entities = prediction.document.entities
    const entity =
        getDateEntity(entities, 'receipt_date') ||
        getDateEntity(entities, 'start_date') ||
        getDateEntity(entities, 'end_date')
    if (entity) {
        const { year, month, day } = entity.normalizedValue.dateValue
        return createDateString(year, month, day)
    }
}
