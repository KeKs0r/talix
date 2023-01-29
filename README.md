# Event Sourcing & CQRS (Kalix Style)

-   CQRS mainly splits Read from Write models.
-   Event Sourcing is used for the Write side, and can feed into the Read Side (views)
-   This is just a mix of concepts from [castore](https://github.com/castore-dev/castore) & [kalix](https://docs.kalix.io/index.html)

In this concept there are 3 main components, and we added one (Actions) as inspired by Kalix

-   Commands: is a function that validates input and the current state and publishes events in the success case
-   Events: are immutable facts that are published by Commands and used to derive the current state
-   Views: are projections from events that represent the current state (can be just the reduce of events for single entities or SQL like tables to allow joins)
-   Actions: are just functions that can be called from the outside, and are allowed to use external services.
    -   Actions can have different triggers (events, http, queues)

## Events, EventTypes, Reducers, Aggregates & Commands

To be honest, the Castore docs make an amazing job to explain this:
[https://github.com/castore-dev/castore](https://github.com/castore-dev/castore)

## Extension and Deviation to Castore

### Actions

Actions are the integral concept to make castore a full application framework. Castore itself is unopinionated how commands are called. Or how to "glue" different parts of the application together. This is where the declarative inspiration of Kalix comes in. They introduce actions as the glue between components of the system.
`Actions are stateless functions that can be triggered in multiple ways`.
Those triggers are:

-   events from entities (e.g. run OCR on uploaded documents)
-   http requests (e.g. create a new user via api)
-   queues

Some of these triggers are only semantical (e.g. trigger when this event happens) and it could under the hood actually be implemented via a queue. But from a developer perspective we mainly care of the semantical:
e.g. trigger this action when this URL is called, or trigger this action when this event happens.

### Actions vs Commands

-   Actions can call commands, but not the other way around
-   Commands can change application state (by creating events), actions only by using commands
-   Actions can call outside services, commands should be almost syncronous, exept for loading the aggregate.

### Commands in an Actor Model

Castore implements persistence in the `EventStore` with a storage adapter. This is just an interface that then calls a "database". There is an in memory implementation as well as one for DynamoDB.
Inspired by Kalix, I think it makes sense to use the Actor Model, to store the state of an entity. The actor model is implemented in Cloudflare with `DurableObjects`.
This solves most of the synscronization problems that occur with distributed systems.

In order to make Commands work with DurableObjects, it makes sense to make a class that has all commands for one entity (=aggregate) as interface. And each Entity (not type, think single ID) then gets its own instance (= persistent state).

## E2E Example how this API could look like

Scenario: Send a url to the service, that then creates a document entity, which then is analyzed with OCR and if an expense is detected, creats an expense.
This is a mix of castore API + How I envision the rest.

### 1. UploadDocumentFromUrlAction

```ts
export const UploadDocumentFromUrlAction = {
    // This is simplification, but tells that the action should be exposed under that url
    httpTrigger: '/documents/upload-from-url',
    inputSchema: UploadDocumentFromUrlActionSchema
    handler: async (input: UploadDocumentFromUrlActionInput, { createDocumentCommand }) => {
        const {url} = input
       const file = await downloadFile(url)
       const { key } = await uploadFileToBucket(file)
       const documentId = generateId()
       const result = await createDocumentHandler({
            // Commands are always applied to 1 instance and need the Id
            aggregateId: documentId,
            payload: {
                key
            }
       })
       return result
    },
}
```

### 2. CreateDocumentCommand

```ts
import { documentCreatedEvent } from './document-created-event'
/**
 * Castore uses Classes, I am not sure if I like classes, but just using one here to show
 * that there can be additional different logic (e.g. ZodCommand vs Command)
 * Maybe having this customizability makes more sense in middleware, but not sure.
 */
export const CreateDocumentCommand = new ZodCommand({
    payloadSchema: CreateCommandPayloadSchema
    handler: async (input: CreateCommandInput, documentStore: DocumentEventStore) => {
        /**
         * The input is already validated by the ZodCommand class.
         * But we could also validate here against the state of the current "Documen"
         * This does not make sense in a "create" scenario though.
         */
        const { aggregateId, payload} = command
        const{ key } = payload
        const event: DocumentCreatedEventDetails = {
            aggregateId,
            version: 1,
            type: documentCreatedEventType.type,
            payload: documentCreatedEventType.payloadSchema.parse({ key }),
        }
        await documentEventStore.pushEvent(event)

        return { documentId:aggregateId }
    }
})
```

### 3. DocumentCreatedEvent

```ts
//Again custore use a class (I think for type inference)
const documentCreatedEvent = new ZodEventType({
    type: 'DOCUMENTS:DOCUMENT_CREATED',
    payloadSchema: documentCreatedPayloadSchema,
})
export type DocumentCreatedEventDetails = EventDetails<typeof documentCreatedEvent>
```

### 4. DocumentCreatedEventReducer

```ts
export const documentReducer: Reducer<DocumentAggregate, DocumentEventDetails> = (
    documentAggregate,
    newEvent: DocumentEventDetails
) => {
    const { aggregateId, version, timestamp } = newEvent

    switch (newEvent.type) {
        case 'DOCUMENTS:DOCUMENT_CREATED': {
            const { name, key } = newEvent.payload
            return {
                aggregateId,
                version,
                name,
                key,
                createdAt: timestamp,
                status: 'CREATED',
            }
        }

        default:
            return documentAggregate
    }
}
```

### 5. AnalyzeDocumentOnCreationAction

```ts
const analyzeDocumentOnCreationAction = {
    /**
     * This is just declerative, this might be connected in the background in memory,
     * or on different services via a queue, that retries if things fail etc...
     */
    eventTrigger: documentCreatedEventType.type,
    handler: async (event: DocumentCreatedEventDetails, { run,get,/*createExpenseCommand, fileStorage*/ }) => {
        const {
            aggregateId,
            payload: { key },
        } = event

        // const file = await downloadFileFromBucket(key)
        const file = await fileStorage.get(key)
        const aiResult = await analyzeDocumentWithAi(file)

        const fileStorage = get(FileStorage)
        const result = run(CreateDocumentCommand, {...})


        if (aiResult.isExpense) {
            const result = await createExpenseCommand({
                aggregateId,
                payload: {
                    amount: aiResult.amount,
                    currency: aiResult.currency,
                    date: aiResult.date,
                    vendor: aiResult.vendor,
                },
            })
            return result
        }
    },
}
```

### 6. Rest

Now there is again an Command, Event and reducer etc. for expenses.
Also I skipped the "model" definition (in the aggregate, which can be a schema or just a type)

```ts

import {salesforce} from '@talix/trigger

import { createUserCommand } from 'domain/document
import {fileStorage} from 'domain/file-storage'

const onEmailSignup = new Action<>({
    on: salesforce.on("Lead.Created")
    handler: async (event, { run, getService }) => {
        const { email } = event
        const upload = await run(fileStorage.put, {

        })
        const fs = getService(fileStorage)
        const result = await run(createUserCommand, {
            email
        })


        return result
    }
    handler: async (event, { documentService }) => {
        const { email } = event
        const result = await createUser({
            email
        })
        return result
    }
})


const onEmailSignup = {
    on: emailSignupEvent.type
    handler: async (event, { run }) => {
        const user = run(GetUserQuery, event.user.id)
        await sendSlackNotification(event.user.firstName)
    }
}
```

```ts

import {...} from 'domain/document
// app/cf-api

export const documentService = app.createService({
    name: 'document',
    actions: {
        uploadDocumentFromUrl: uploadDocumentFromUrlAction,
        analyzeDocumentOnCreation: analyzeDocumentOnCreationAction,
    },
    commands: {
        createDocument: createDocumentCommand,
    },
    events: {
        documentCreated: documentCreatedEvent,
    },
    queries: {
        getDocument: getDocumentQuery,
    },
    reducers: {
        document: documentReducer,
    },
})

// docmain/document
export const documentService = {
    action: {

    }
    commands: {
         createDcoument: createDocumentCommand
    },
    events: Record<string, Event>
    queries: Record<string, Query>
    projections: Record<string, Projections>
}

const runtime = cloudflareRuntime.use(
    orchidReporter()
)
.register(new CloudflareFileStorage())
.register(new IdGenerator())
.create()


function create(){
    const context = {
        get fileStorage(): {
            ....
        }
    }
}

const service = runtime.createService(documentService)


- Runtime
- EventSourcingFramework
- Services (Actions, Commands, Events, Queries, Projections)
- shared {
    FileStorage
    IdGenerator
}



// AiService

import {documentService} from 'domain/document
import {invoiceService} from 'domain/invoice

const onDocumentCreated = {
on: documentService.events.created.type
    handler(event, {call}){
    const invoice = analyzeDocument(event.document)
    call(invoiceService.command.createInvoice, invoice)
    }
}

```

Pure World

-   eventStore.adapter (KV Store)
-   action.httpTrigger (expose routes)
-   action.eventTrigger (listen to events, via Queues or PubSub)
-   ?? Services (e.g. FileStorage)

Where do I need to Inject them?
Actions:

-   use services: e.g. FileStorage (via get),
-   call commands (via run)
    Commands:
-   need load Data from other entities (e.g. Invoice needs to load its document)

---

User(id#3) {
command(aggragetId)
-> eventStore.pushEvent()

    eventStore
        -> eventStore.adapter.pushEvent(arregateId, event)
    }

---

```

```
