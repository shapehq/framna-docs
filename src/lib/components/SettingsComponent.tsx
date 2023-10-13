"use client"

import { Popover, List, Button, IconButton } from "@mui/material";
import { MoreHoriz } from '@mui/icons-material';
import { useState } from "react";
import DocumentationViewerSelectorComponent from "./settings/DocumentationViewerSelectorComponent";
import { DocumentationVisualizer } from "./DocumentationViewerComponent";

export interface ISettings {
  documentationVisualizer: DocumentationVisualizer;
}

const SettingsComponent: React.FC = () => {
  const [popoverAnchorElement, setPopoverAnchorElement] = useState<HTMLButtonElement | null>(null);
  
  const handlePopoverClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPopoverAnchorElement(event.currentTarget);
  };
  
  const handlePopoverClose = () => {
    setPopoverAnchorElement(null);
  };
  
  const isPopoverOpen = Boolean(popoverAnchorElement);
  const id = isPopoverOpen ? 'settings-popover' : undefined;

  return (
    <div>
      <Popover
        id={id}
        open={isPopoverOpen}
        anchorEl={popoverAnchorElement}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        elevation={2}
      >
        <List sx={{ padding: "10px"}}>
          <DocumentationViewerSelectorComponent/>
          <Button
            variant="text"
            fullWidth={true}
            style={{justifyContent: "flex-start"}}
            href="/api/auth/logout"
            sx={{ marginTop: "10px" }}
            color="secondary"
          >
            Log out
          </Button>
        </List>
      </Popover>
      <IconButton onClick={handlePopoverClick}>
        <MoreHoriz />
      </IconButton>
    </div>
  );
};

export default SettingsComponent;
