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
