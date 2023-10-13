"use client";

import { Avatar, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IProject } from "../projects/IProject";
import { Folder, FolderOpen } from "@mui/icons-material";
import { getProject } from "../utils/UrlUtils";
import { useState } from "react";
import ProjectChangedEvent from "../events/ProjectChangedEvent";
import { publish } from "../utils/EventsUtils";
import { useRouter } from "next/navigation";
import StringAvatar from "./StringAvatar";
import { IGitHubProject } from "../projects/IGitHubProject";

interface ProjectComponentProps {
  project: IGitHubProject;
  selectedProject: boolean;
}

const ProjectComponent: React.FC<ProjectComponentProps> = ({ project, selectedProject }) => {
  const router = useRouter();

  const selectProject = () => {
    router.push(`/${project.repository.replace("-openapi", "")}`);
  };
  const theme = useTheme();

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={selectProject}>
        {project.image && (
          <Avatar
            src={project.image}
            sx={{
              width: 35,
              height: 35,
              marginRight: "10px",
              border: `1px solid ${theme.palette.divider}`,
            }}
            alt={project.name}
          />
        )}
        {!project.image && (
          <StringAvatar
            string={project.name}
            sx={{ width: 35, height: 35, marginRight: "10px" }}
          />
        )}
        {selectedProject && 
          <ListItemText 
            primary={
              <Typography style={{ color: theme.palette.secondary.light, fontWeight: 'bold' }}>
                {project.name}
              </Typography>
            }
          /> 
        }
        {!selectedProject && <ListItemText primary={project.name} /> }
      </ListItemButton>
    </ListItem>
  );
};

export default ProjectComponent;
