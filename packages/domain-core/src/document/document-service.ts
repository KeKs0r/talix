import { Service } from '@chute/core'

import { createDocumentCommand } from './document-create-command'
import { documentEventStore } from './document-eventstore'
import { uploadDocumentFromUrlAction } from './upload-document-url-action'
import { documentCreatedEventType } from './document-created-event'

export const documentService: Service = {
    name: 'DOCUMENT',
    store: documentEventStore,
    actions: [uploadDocumentFromUrlAction],
    commands: [createDocumentCommand],
    events: [documentCreatedEventType],
}
