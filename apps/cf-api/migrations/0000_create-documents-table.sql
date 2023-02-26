-- Migration number: 0000 	 2023-02-25T23:15:54.554Z
create table "documents" (
    "aggregateId" varchar(26) unique primary key,
    "version" integer,
    "hash" varchar(80),
    "data" text
);

CREATE INDEX idx_hash ON "documents" (hash);