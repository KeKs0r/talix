import { $Contravariant, AggregateService, Chute } from '@chute/core'
import { RuntimeContext } from '@chute/cf-runtime'

import { createDocumentCommand } from './command/document-create-command'
import { createDocumentEventStore } from './document-eventstore'
import { uploadDocumentFromUrlAction } from './actions/upload-document-url-action'
import { documentCreatedEventType } from './command/document-created-event'
import { documentProjection } from './query/document-projection'
import { listDocumentActions } from './actions/http-documents-list'

const documentAggregate: AggregateService<RuntimeContext> = {
    name: 'document',
    storeFactory: createDocumentEventStore,
    commands: [createDocumentCommand],
    events: [documentCreatedEventType],
}

export function documentService<C extends RuntimeContext = RuntimeContext>(chute: Chute<C>) {
    return chute
        .registerAggregate(documentAggregate)
        .registerAction(uploadDocumentFromUrlAction)
        .registerAction(documentProjection)
        .registerAction(listDocumentActions)
}
