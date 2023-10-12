import { IProject } from "./IProject"

export interface IProjectRepository {
  getProjects(): Promise<IProject[]>
}
