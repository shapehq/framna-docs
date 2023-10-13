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
import { getProject } from "../utils/UrlUtils";
import { useState } from "react";
import ProjectChangedEvent from "../events/ProjectChangedEvent";
import { publish } from "../utils/EventsUtils";
import { useRouter } from "next/navigation";

interface ProjectComponentProps {
  project: IProject;
}

const ProjectComponent: React.FC<ProjectComponentProps> = ({ project }) => {
  const [selectedProject, setSelectedProject] = useState(
    getProject() === project.name
  );
    const router = useRouter();

  const selectProject = () => {
    router.push(`/${project.name}`);
    setSelectedProject(true);
  };

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={selectProject}>
        <ListItemIcon>
          {selectedProject ? <FolderOpen /> : <Folder />}
        </ListItemIcon>
        <ListItemText primary={project.name} />
      </ListItemButton>
    </ListItem>
  );
};

export default ProjectComponent;
