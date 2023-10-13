"use client";

import {
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { IProject } from "../projects/IProject";

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
        <ListItemText primary={project.name} />
      </ListItemButton>
    </ListItem>
  );
};

export default ProjectComponent;
