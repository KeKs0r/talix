import type { Reducer } from "@castore/core";
import { DocumentAggregate } from "./document-aggregate";
import { DocumentCreatedEventTypeDetail } from "./document-uploaded-event";

type DocumentEventDetails = DocumentCreatedEventTypeDetail;

export const documentReducer: Reducer<
  DocumentAggregate,
  DocumentEventDetails
> = (documentAggregate, newEvent: DocumentEventDetails) => {
  const { aggregateId, version, timestamp } = newEvent;

  switch (newEvent.type) {
    case "DOCUMENTS:DOCUMENT_UPLOADED": {
      const { name, url } = newEvent.payload;

      // 👇 Return the next version of the aggregate
      return {
        aggregateId,
        version,
        name,
        url,
        createdAt: timestamp,
        status: "CREATED",
      };
    }
    // case "USER_REMOVED":
    //   return { ...userAggregate, version, status: "REMOVED" };
    default:
      return documentAggregate;
  }
};
