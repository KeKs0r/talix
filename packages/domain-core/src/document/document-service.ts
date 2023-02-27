import { AggregateService, Chute } from '@chute/core'
import { RuntimeContext } from '@chute/cf-runtime'

import { createDocumentCommand } from './document-create-command'
import { createDocumentEventStore } from './document-eventstore'
import { uploadDocumentFromUrlAction } from './upload-document-url-action'
import { documentCreatedEventType } from './document-created-event'
import { documentProjection } from './document-projection'
import { listDocumentActions } from './http-documents-list'

const documentAggregate: AggregateService<RuntimeContext> = {
    name: 'document',
    storeFactory: createDocumentEventStore,
    commands: [createDocumentCommand],
    events: [documentCreatedEventType],
}

export function documentService<C extends RuntimeContext = RuntimeContext>(app: Chute<C>) {
    app.registerAggregate(documentAggregate)
    app.registerAction(uploadDocumentFromUrlAction)
    app.registerAction(documentProjection)
    app.registerAction(listDocumentActions)
}
