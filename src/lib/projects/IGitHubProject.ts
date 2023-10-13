import { IProject } from "./IProject";

export interface IGitHubProject extends IProject {
  readonly owner: string
  readonly repository: string
  readonly defaultBranch: string
}
