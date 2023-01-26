import assert from 'assert'

import { EventAction } from 'castore-extended'
import { documentCreatedEventType, DocumentCreatedEventTypeDetail } from 'domain-core'
import type { FileStorage } from 'cf-r2-file-storage'

import { DocummentAnalyzer } from '../document-ai/analyze-document'
import { parseResponse } from '../document-ai/fetch-file'

type AnalzeCreatedDocumentDeps = {
    fileStorage: FileStorage
    documentAnalyzer: DocummentAnalyzer
    // createVoucherCommand:
}

export const analyzeCreatedDocumentAction = new EventAction({
    actionId: 'OCR:ANALYZE_CREATED_DOCUMENT_ACTION',
    trigger: documentCreatedEventType.type,
    handler: async (
        event: DocumentCreatedEventTypeDetail,
        { fileStorage }: AnalzeCreatedDocumentDeps
    ) => {
        const key = event.payload.key
        const file = await fileStorage.get(key)
        assert(file, `Could not find file with key ${key}`)

        const input = await parseResponse(file)
    },
})
