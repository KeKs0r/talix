import { asClass } from 'awilix'
import { Chute } from '@chute/core'

import { analyzeCreatedDocumentAction } from './domain/analyze-created-document-action'
import { DocumentAnalyzer } from './document-ai/analyze-document'

export function ocrService(app: Chute) {
    app.registerAction(analyzeCreatedDocumentAction)
    app.container.register('documentAnalyzer', asClass(DocumentAnalyzer))
}
