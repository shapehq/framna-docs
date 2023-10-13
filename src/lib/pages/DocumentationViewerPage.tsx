"use client";

import { Box } from "@mui/material";
import DocumentationViewerComponent from "../components/DocumentationViewerComponent";
import { IOpenApiSpecification } from "../projects/IOpenAPISpecification";

interface DocumentationViewerPageProps {
  openApiSpecification: IOpenApiSpecification;
}

const DocumentationViewerPage: React.FC<DocumentationViewerPageProps> = ({
  openApiSpecification,
}) => {
  return (
    <Box style={{ paddingTop: "50px" }}>
      <DocumentationViewerComponent url={openApiSpecification.url} />
    </Box>
  );
};

export default DocumentationViewerPage;
