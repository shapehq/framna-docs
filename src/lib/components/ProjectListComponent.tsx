import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ProjectRepository } from "../projects/ProjectRepository";
import ProjectComponent from "./ProjectComponent";

interface ProjectListComponentProps {
  projectRepository: ProjectRepository;
}

const ProjectListComponent: React.FC<ProjectListComponentProps> = async ({
  projectRepository,
}) => {
  const projects = await projectRepository.getProjects();
  projects.push(...projects);
  projects.push(...projects);
  projects.push(...projects);
  projects.push(...projects);
  projects.push(...projects);
  projects.push(...projects);
  projects.push(...projects);
  projects.push(...projects);
  projects.push(...projects);
  projects.push(...projects);

  return (
    <List
      sx={{
        overflowY: "scroll",
      }}
    >
      {projects.map((project, index) => (
        <ProjectComponent project={project} key={index} />
      ))}
    </List>
  );
};

export default ProjectListComponent;
