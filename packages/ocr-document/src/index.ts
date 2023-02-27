import { asClass } from 'awilix'
import { BaseContext, Chute } from '@chute/core'

import { analyzeCreatedDocumentAction } from './domain/analyze-created-document-action'
import { DocumentAnalyzer } from './document-ai/analyze-document'

export function ocrService<C extends BaseContext = BaseContext>(app: Chute<C>) {
    app.registerAction(analyzeCreatedDocumentAction)
    app.container.register('documentAnalyzer', asClass(DocumentAnalyzer))
}
