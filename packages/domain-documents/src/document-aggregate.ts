import type { Aggregate } from "@castore/core";

type DateTimeString = string;

export interface DocumentAggregate extends Aggregate {
  name: string;
  url: string;
  status: "CREATED" | "ANALYZED";
  createdAt: DateTimeString;
}
