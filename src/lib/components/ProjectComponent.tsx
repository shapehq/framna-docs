"use client";

import {
  Avatar,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useTheme } from '@mui/material/styles'
import { IProject } from "../projects/IProject";
import StringAvatar from "./StringAvatar";

interface ProjectComponentProps {
  project: IProject;
  selectedProject?: boolean;
}

const ProjectComponent: React.FC<ProjectComponentProps> = ({
  project,
  selectedProject,
}) => {
  const theme = useTheme()
  
  return (
    <ListItem disablePadding>
      <ListItemButton href="{`/${project.name}`}">
        {project.image && 
          <Avatar 
            src={project.image} 
            sx={{ 
              width: 35, 
              height: 35, 
              marginRight: "10px", 
              border: `1px solid ${theme.palette.divider}`
            }} 
            alt={project.name}
          />
        }
        {!project.image && 
          <StringAvatar
            string={project.name} 
            sx={{ width: 35, height: 35, marginRight: "10px" }}
          />
        }
        <ListItemText primary={project.name} />
      </ListItemButton>
    </ListItem>
  );
};

export default ProjectComponent;
