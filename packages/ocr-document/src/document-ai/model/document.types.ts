import { ExpenseEntities } from './expense.types'

interface BaseDocumentAiResponse<Entities> {
    document: {
        uri: string
        mimeType: string
        text: string
        pages: Page[]
        entities: Entities[]
    }
    humanReviewStatus: {
        state: 'SKIPPED'
        stateMessage: string
    }
}
export type ExpenseResponse = BaseDocumentAiResponse<ExpenseEntities>

interface Page {}
