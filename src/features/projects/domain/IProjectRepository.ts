import Project from "./Project"

export default interface IProjectRepository {
  get(): Promise<Project[] | undefined>
  set(projects: Project[]): Promise<void>
  delete(): Promise<void>
}
