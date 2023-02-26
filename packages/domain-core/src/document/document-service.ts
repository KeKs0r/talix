import { Aggregate, Chute } from '@chute/core'

import { createDocumentCommand } from './document-create-command'
import { documentEventStore } from './document-eventstore'
import { uploadDocumentFromUrlAction } from './upload-document-url-action'
import { documentCreatedEventType } from './document-created-event'
import { documentProjection } from './document-projection'

const documentAggregate: Aggregate = {
    name: 'document',
    store: documentEventStore,
    commands: [createDocumentCommand],
    events: [documentCreatedEventType],
}

export function documentService(app: Chute) {
    app.registerAggregate(documentAggregate)
    app.registerAction(uploadDocumentFromUrlAction)
    app.registerAction(documentProjection)
}
