import { ok } from 'common'
import { EventAction } from '@chute/core'
import {
    documentCreatedEventType,
    DocumentCreatedEventTypeDetail,
    DocumentCreatedPayload,
    createVoucherCommand,
    CreateVoucherInput,
    DateString,
    createDateString,
} from 'domain-core'

import { analyzeExpense } from '../document-ai/analyze-document'
import { parseResponse } from '../document-ai/fetch-file'
import { ExpenseResponse } from '../document-ai/model/document.types'
import { getDateEntity } from '../document-ai/model/expense.types'

export const analyzeCreatedDocumentAction = new EventAction<'OCR:ANALYZE_CREATED_DOCUMENT_ACTION'>({
    actionId: 'OCR:ANALYZE_CREATED_DOCUMENT_ACTION',
    eventTrigger: documentCreatedEventType.type,
    handler: async (event: DocumentCreatedEventTypeDetail, { fileStorage, run }) => {
        const documentId = event.aggregateId
        const { key } = event.payload as DocumentCreatedPayload
        const file = await fileStorage.get(key)
        ok(file, `Could not find file with key ${key}`)
        const fileInput = await parseResponse(file)

        const prediction = await analyzeExpense(fileInput)
        const voucherDate = getVoucherDate(prediction)

        const input: CreateVoucherInput = {
            creditOrDebit: 'DEBIT',
            vatTaxType: 'EU',
            documentId: documentId,
            voucherDate,
        }
        await run(createVoucherCommand, input)
    },
})

function getVoucherDate(prediction: ExpenseResponse): DateString | undefined {
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
