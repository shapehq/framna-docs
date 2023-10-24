import Project from "./Project"

export default interface IProjectDataSource {
  getProjects(): Promise<Project[]>
}
