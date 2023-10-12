"use client";

import { useEffect, useState } from "react";
import DocumentationViewerComponent from "../components/DocumentationViewerComponent";
import { Events } from "../events/BaseEvent";
import { IOpenApiSpecification } from "../projects/IOpenApiSpecification";
import { subscribe, unsubscribe } from "../utils/EventsUtils";
import { OpenApiSpecificationChangedEventData } from "../events/OpenApiSpecificationChangedEvent";

interface DocumentationViewerPageProps {
  openApiSpecification: IOpenApiSpecification;
}

const DocumentationViewerPage: React.FC<DocumentationViewerPageProps> = ({
  openApiSpecification,
}) => {
  const [url, setUrl] = useState(openApiSpecification.url);

  useEffect(() => {
    const openApiSpecificationChangedListener = (
      event: CustomEvent<OpenApiSpecificationChangedEventData>
    ) => {
      setUrl(event.detail.openApiSpecification.url);
    };
    subscribe(Events.OPEN_API_SPECIFICATION_CHANGED, openApiSpecificationChangedListener);
    return () => {
      unsubscribe(Events.OPEN_API_SPECIFICATION_CHANGED, openApiSpecificationChangedListener);
    };
  });

  return <DocumentationViewerComponent url={url} />;
};

export default DocumentationViewerPage;
