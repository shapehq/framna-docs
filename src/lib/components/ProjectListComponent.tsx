import { List, Divider } from "@mui/material";
import ProjectComponent from "./ProjectComponent";
import { IProjectRepository } from "../projects/IProjectRepository";
import { IGitHubProject } from "../projects/IGitHubProject";

interface ProjectListComponentProps {
  projectRepository: IProjectRepository;
}

const ProjectListComponent: React.FC<ProjectListComponentProps> = async ({
  projectRepository,
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
          <ProjectComponent project={project} />
          {index < projects.length - 1 && <Divider />}
        </div>
      ))}
    </List>
  );
};

export default ProjectListComponent;
