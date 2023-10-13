"use client";

import { Box } from "@mui/material";
import DocumentationViewerComponent from "../components/DocumentationViewerComponent";

interface DocumentationViewerPageProps {
  url: string;
}

const DocumentationViewerPage: React.FC<DocumentationViewerPageProps> = ({
  url,
}) => {
  return (
    <Box style={{ paddingTop: '50px' }}>
      <DocumentationViewerComponent
        url={url}
      />
    </Box>
  );
};

export default DocumentationViewerPage;
