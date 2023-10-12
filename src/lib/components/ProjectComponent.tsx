import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Project } from "../projects/Project";
import { Folder, FolderOpen } from "@mui/icons-material";

interface ProjectComponentProps {
  project: Project;
  selectedProject?: boolean;
}

const ProjectComponent: React.FC<ProjectComponentProps> = ({
  project,
  selectedProject,
}) => {
  return (
    <ListItem disablePadding>
      <ListItemButton>
        <ListItemIcon>
          {selectedProject ? <FolderOpen /> : <Folder />}
        </ListItemIcon>
        <ListItemText primary={project.name} />
      </ListItemButton>
    </ListItem>
  );
};

export default ProjectComponent;
