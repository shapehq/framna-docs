import {
  FolderOpen,
  Folder,
  Settings,
  ArrowDropDown,
  ExpandLess,
  ExpandMore,
  StarBorder,
  Preview,
} from "@mui/icons-material";
import {
  Collapse,
  Fade,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState } from "react";
import DocumentationViewerSelectorComponent from "./settings/DocumentationViewerSelectorComponent";
import { DocumentationVisualizer } from "./DocumentationViewerComponent";

export interface ISettings {
  documentationVisualizer: DocumentationVisualizer;
}

const SettingsComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <List>
      <ListItemButton onClick={toggleOpen}>
        <ListItemIcon>
          <Settings />
        </ListItemIcon>
        <ListItemText primary="Settings" />
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse
        in={isOpen}
        timeout="auto"
        unmountOnExit
        sx={{
          minHeight: "initial !important",
        }}
      >
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemIcon>
              <Preview />
            </ListItemIcon>
            <DocumentationViewerSelectorComponent />
          </ListItemButton>
        </List>
      </Collapse>
    </List>
  );
};

export default SettingsComponent;
