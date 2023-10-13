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
  return <DocumentationViewerComponent url={openApiSpecification.url} />;
};

export default DocumentationViewerPage;
