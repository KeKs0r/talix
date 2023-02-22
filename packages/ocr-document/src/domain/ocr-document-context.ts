import { RuntimeContext } from '@chute/cf-runtime'

import { DocumentAnalyzer } from '../document-ai/analyze-document'

export interface OcrDocumentContext extends RuntimeContext {
    documentAnalyzer: DocumentAnalyzer
}
