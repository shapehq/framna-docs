"use client";

import DocumentationViewerComponent, {
} from "../components/DocumentationViewerComponent";

interface DocumentationViewerPageProps {
  url: string;
}

const DocumentationViewerPage: React.FC<DocumentationViewerPageProps> = ({
  url,
}) => {
  return (
    <DocumentationViewerComponent
      url={url}
    />
  );
};

export default DocumentationViewerPage;
