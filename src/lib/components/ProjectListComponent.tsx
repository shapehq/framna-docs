import { List, Divider } from "@mui/material";
import ProjectComponent from "./ProjectComponent";
import { IProjectRepository } from "../projects/IProjectRepository";
import { IGitHubProject } from "../projects/IGitHubProject";

interface ProjectListComponentProps {
  projectRepository: IProjectRepository;
  projectName?: string;
}

const ProjectListComponent: React.FC<ProjectListComponentProps> = async ({
  projectRepository,
  projectName
}) => {
  const projects = (await projectRepository.getProjects()) as IGitHubProject[];
  // projects.push(...projects);
  // projects.push(...projects);
  // projects.push(...projects);
  // projects.push(...projects);
  // projects.push(...projects);
  // projects.push(...projects);
  // projects.push(...projects);
  // projects.push(...projects);
  // projects.push(...projects);
  // projects.push(...projects);
  
  const isSelected = (project: IGitHubProject) => {
    return projectName == project.repository
  }

  return (
    <List
      sx={{
        overflowY: "scroll",
        width: "100%",
        height: "100%",
      }}
    >
      {projects.map((project, index) => (
        <div key={index}>
          {(index == 0 && isSelected(project)) && <Divider />}
          <ProjectComponent project={project} selectedProject={isSelected(project)} />
          {(index < projects.length - 1 || isSelected(project)) && <Divider />}
        </div>
      ))}
    </List>
  );
};

export default ProjectListComponent;
