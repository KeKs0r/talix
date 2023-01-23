import { EventStore } from "@castore/core";

import { documentUploadedEventType } from "./document-uploaded-event";
import { documentReducer } from "./document-reducer";

export const documentEventStore = new EventStore({
  eventStoreId: "DOCUMENTS",
  eventStoreEvents: [documentUploadedEventType],
  reduce: documentReducer,
});
