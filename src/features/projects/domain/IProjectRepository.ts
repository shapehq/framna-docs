import Project from "./Project"

export default interface IProjectRepository {
  getProjects(): Promise<Project[]>
  storeProjects(projects: Project[]): Promise<void>
}
