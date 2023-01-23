import { createDocumentService } from 'domain-documents'

export function createApp() {
    const documentService = createDocumentService()
    return {
        documentService,
    }
}

export type App = ReturnType<typeof createApp>
