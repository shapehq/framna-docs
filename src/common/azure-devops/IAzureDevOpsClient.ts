export type AzureDevOpsRepository = {
  readonly id: string
  readonly name: string
  readonly defaultBranch?: string
  readonly webUrl: string
  readonly project: {
    readonly id: string
    readonly name: string
  }
}

export type AzureDevOpsRef = {
  readonly name: string // e.g., "refs/heads/main"
  readonly objectId: string
}

export type AzureDevOpsItem = {
  readonly path: string
  readonly gitObjectType: "blob" | "tree"
}

export default interface IAzureDevOpsClient {
  getRepositories(): Promise<AzureDevOpsRepository[]>
  getRefs(repositoryId: string): Promise<AzureDevOpsRef[]>
  getItems(repositoryId: string, scopePath: string, version: string): Promise<AzureDevOpsItem[]>
  getFileContent(repositoryId: string, path: string, version: string): Promise<string | ArrayBuffer | null>
}
