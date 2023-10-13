import { List, Divider } from "@mui/material";
import ProjectComponent from "./ProjectComponent";
import { IProjectRepository } from "../projects/IProjectRepository";
import { IGitHubProject } from "../projects/IGitHubProject";
import { getProject } from "../utils/UrlUtils";

interface ProjectListComponentProps {
  projectRepository: IProjectRepository;
  projectName?: string;
}

const ProjectListComponent: React.FC<ProjectListComponentProps> = async ({
  projectRepository,
  projectName
}) => {
  const projects = (await projectRepository.getProjects()) as IGitHubProject[];
  console.log(projects, projects)
  console.log(projectName, projectName)
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
          <ProjectComponent project={project} selectedProject={projectName == project.repository} />
          {index < projects.length - 1 && <Divider />}
        </div>
      ))}
    </List>
  );
};

export default ProjectListComponent;
