"use client";

import SwaggerComponent from "./SwaggerComponent";
import RedoclyComponent from "./RedoclyComponent";
import { getSettings } from "../utils/SettingsUtils";

export enum DocumentationVisualizer {
  SWAGGER,
  REDOCLY,
}

export interface DocumentationViewerComponentProps {
  url: string;
}

const DocumentationViewerComponent: React.FC<
  DocumentationViewerComponentProps
> = ({ url }) => {
  const visualizer = getSettings().documentationVisualizer;

  switch (visualizer) {
    case DocumentationVisualizer.SWAGGER:
      return <SwaggerComponent url={url} />;

    case DocumentationVisualizer.REDOCLY:
      return <RedoclyComponent url={url} />;
  }
};

export default DocumentationViewerComponent;
