import Project from "./Project"

export default interface ISessionProjectRepository {
  getProjects(): Promise<Project[] | undefined>
  storeProjects(projects: Project[]): Promise<void>
  deleteProjects(): Promise<void>
}
