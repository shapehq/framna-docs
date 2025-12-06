export type AzureDevOpsRepositoryWithRefs = {
  readonly name: string
  readonly owner: string  // organization
  readonly defaultBranchRef: {
    readonly id: string
    readonly name: string
  }
  readonly webUrl: string
  readonly configYml?: {
    readonly text: string
  }
  readonly configYaml?: {
    readonly text: string
  }
  readonly branches: AzureDevOpsRepositoryRef[]
  readonly tags: AzureDevOpsRepositoryRef[]
}

export type AzureDevOpsRepositoryRef = {
  readonly id: string
  readonly name: string
  readonly files: {
    readonly name: string
  }[]
}

export default interface IAzureDevOpsRepositoryDataSource {
  getRepositories(): Promise<AzureDevOpsRepositoryWithRefs[]>
}
