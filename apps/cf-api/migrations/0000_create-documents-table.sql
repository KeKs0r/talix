-- Migration number: 0000 	 2023-02-25T23:15:54.554Z
create table "vouchers" (
    "aggregateId" varchar(26) unique primary key,
    "version" integer,
    "documentHash" varchar(80),
    "data" text
);

CREATE INDEX idx_hash ON "vouchers" (documentHash);