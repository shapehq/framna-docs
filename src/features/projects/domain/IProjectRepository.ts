import IProject from "./IProject"

export default interface IProjectRepository<ProjectType extends IProject> {
  getProjects(): Promise<ProjectType[]>
}
