import z from "zod";

import { ZodEventType } from "@castore/zod-event";
import { EventTypeDetail } from "@castore/core";

const documentUploadedPayloadSchema = z.object({
  name: z.string(),
  url: z.string(),
});

const documentUploadedMetadataSchema = z.object({
  channel: z.string().optional(),
});

export const documentUploadedEventType = new ZodEventType({
  type: "DOCUMENTS:DOCUMENT_UPLOADED",
  payloadSchema: documentUploadedPayloadSchema,
  metadataSchema: documentUploadedMetadataSchema,
});

export type DocumentCreatedEventTypeDetail = EventTypeDetail<
  typeof documentUploadedEventType
>;
