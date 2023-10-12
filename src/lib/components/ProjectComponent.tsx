"use client";

import {
  Link,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { IProject } from "../projects/IProject";
import { Folder, FolderOpen } from "@mui/icons-material";
import { useContext } from "react";

interface ProjectComponentProps {
  project: IProject;
  selectedProject?: boolean;
}

const ProjectComponent: React.FC<ProjectComponentProps> = ({
  project,
  selectedProject,
}) => {
  return (
    <ListItem disablePadding>
      <ListItemButton href="{`/${project.name}`}">
        <ListItemIcon>
          {selectedProject ? <FolderOpen /> : <Folder />}
        </ListItemIcon>
        <ListItemText primary={project.name} />
      </ListItemButton>
    </ListItem>
  );
};

export default ProjectComponent;
