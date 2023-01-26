import assert from 'assert'

import { EventAction } from 'castore-extended'
import {
    documentCreatedEventType,
    DocumentCreatedEventTypeDetail,
    DocumentCreatedPayload,
    VoucherService,
    CreateVoucherInput,
    DateString,
    createDateString,
} from 'domain-core'
import type { FileStorage } from 'cf-r2-file-storage'

import { DocummentAnalyzer } from '../document-ai/analyze-document'
import { parseResponse } from '../document-ai/fetch-file'
import { ExpenseResponse } from '../document-ai/model/document.types'
import { getDateEntity } from '../document-ai/model/expense.types'

type AnalzeCreatedDocumentDeps = {
    fileStorage: FileStorage
    documentAnalyzer: DocummentAnalyzer
    createVoucher: VoucherService['commands']['createVoucher']['run']
}

export const analyzeCreatedDocumentAction = new EventAction({
    actionId: 'OCR:ANALYZE_CREATED_DOCUMENT_ACTION',
    trigger: documentCreatedEventType.type,
    handler: async (
        event: DocumentCreatedEventTypeDetail,
        { fileStorage, documentAnalyzer, createVoucher }: AnalzeCreatedDocumentDeps
    ) => {
        const documentId = event.aggregateId
        const { key } = event.payload as DocumentCreatedPayload
        const file = await fileStorage.get(key)
        assert(file, `Could not find file with key ${key}`)
        const fileInput = await parseResponse(file)

        const prediction = await documentAnalyzer.analyzeExpense(fileInput)
        const voucherDate = getVoucherDate(prediction)

        const input: CreateVoucherInput = {
            creditOrDebit: 'DEBIT',
            vatTaxType: 'EU',
            documentId: documentId,
            voucherDate,
        }
        await createVoucher(input)
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
