import SwaggerComponent from "./SwaggerComponent";
import RedoclyComponent from "./RedoclyComponent";

export enum DocumentationVisualizer {
  SWAGGER,
  REDOCLY,
}

export interface DocumentationViewerComponentProps {
  url: string;
  visualizer: DocumentationVisualizer;
}

const DocumentationViewerComponent: React.FC<
  DocumentationViewerComponentProps
> = ({ url, visualizer }) => {

  switch (visualizer) {
    case DocumentationVisualizer.SWAGGER:
      return <SwaggerComponent url={url} />;

    case DocumentationVisualizer.REDOCLY:
      return <RedoclyComponent url={url} />;
  }
};

export default DocumentationViewerComponent;
