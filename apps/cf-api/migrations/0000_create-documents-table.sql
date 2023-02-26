-- Migration number: 0000 	 2023-02-25T23:15:54.554Z
create table "documents" (
    "aggregateId" varchar(26) unique primary key,
    "version" integer,
    "name" varchar(255),
    "key" varchar(255),
    "status" varchar(80),
    "hash" varchar(80),
    "createdAt" datetime
);