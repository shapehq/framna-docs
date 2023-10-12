import { List } from "@mui/material";
import ProjectComponent from "./ProjectComponent";
import { IProjectRepository } from "../projects/IProjectRepository";

interface ProjectListComponentProps {
  projectRepository: IProjectRepository;
}

const ProjectListComponent: React.FC<ProjectListComponentProps> = async ({
  projectRepository,
}) => {
  const projects = await projectRepository.getProjects();
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

  return (
    <List
      sx={{
        overflowY: "scroll",
        height: "100%"
      }}
    >
      {projects.map((project, index) => (
        <ProjectComponent project={project} key={index} />
      ))}
    </List>
  );
};

export default ProjectListComponent;
