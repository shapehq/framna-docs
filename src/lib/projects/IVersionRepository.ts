import { IVersion } from "./IVersion"
import { IProject } from "./IProject"

export interface IVersionRepository {
  getVersions(project: IProject): Promise<IVersion[]>
}