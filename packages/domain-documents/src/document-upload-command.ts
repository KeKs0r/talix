/// <reference lib="dom" />
import z from "zod";
import { Command, tuple } from "@castore/core";
import { basename } from "path";
import { documentEventStore } from "./document-eventstore";
import { DocumentCreatedEventTypeDetail } from "./document-uploaded-event";

const uploadDocumentCommandInputSchema = z.object({
  url: z.string(),
});
type Input = z.infer<typeof uploadDocumentCommandInputSchema>;
type Output = { documentId: string };
type Context = { generateUuid: () => string };

export const uploadDocumentCommand = new Command({
  commandId: "DOCUMENT:UPLOAD_USER",
  requiredEventStores: tuple(documentEventStore),
  handler: async (
    commandInput: Input,
    [documentEventStore],
    { generateUuid }: Context
  ): Promise<Output> => {
    const { url } = uploadDocumentCommandInputSchema.parse(commandInput);

    const res = await fetch(url);
    if (res.status !== 200) {
      throw new Error("Document is not accessible");
    }

    const documentId = generateUuid();

    const event: DocumentCreatedEventTypeDetail = {
      aggregateId: documentId,
      version: 1,
      type: "DOCUMENTS:DOCUMENT_UPLOADED",
      payload: { name: basename(url), url },
    };

    await documentEventStore.pushEvent(event);

    return { documentId };
  },
});
