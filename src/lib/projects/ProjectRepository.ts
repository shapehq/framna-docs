import { Project } from "./Project"

export interface ProjectRepository {
  getProjects(): Promise<Project[]>
}
