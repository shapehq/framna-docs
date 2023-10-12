import { IVersion } from "./IVersion"

export interface IGitHubVersion extends IVersion {
  readonly owner: string
  readonly repository: string
}
