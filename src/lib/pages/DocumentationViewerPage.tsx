"use client";

import { Box, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import DocumentationViewerComponent, {
  DocumentationVisualizer,
} from "../components/DocumentationViewerComponent";
import { useContext, useState } from "react";
import { SettingsContext } from "./FrontPage";

interface DocumentationViewerPageProps {
  url: string;
}

const DocumentationViewerPage: React.FC<DocumentationViewerPageProps> = ({
  url,
}) => {
    const context = useContext(SettingsContext);

  return (
    <Box>
      <DocumentationViewerComponent url={url} visualizer={context.settings.documentationVisualizer} />
    </Box>
  );
};

export default DocumentationViewerPage;
