import { RepositoryWithRefs, RepositoryRef } from "./ProjectMapper"

/**
 * Azure DevOps repository ref type.
 */
export type AzureDevOpsRepositoryRef = RepositoryRef & {
  readonly id: string  // Required in Azure DevOps (optional in base type)
}

/**
 * Azure DevOps repository type with webUrl for URL building.
 */
export type AzureDevOpsRepositoryWithRefs = RepositoryWithRefs & {
  readonly defaultBranchRef: {
    readonly id: string  // Required in Azure DevOps
    readonly name: string
  }
  readonly webUrl: string
  readonly branches: AzureDevOpsRepositoryRef[]
  readonly tags: AzureDevOpsRepositoryRef[]
}

export default interface IAzureDevOpsRepositoryDataSource {
  getRepositories(): Promise<AzureDevOpsRepositoryWithRefs[]>
}
