export type GitHubRepository = {
  readonly name: string
  readonly owner: string
  readonly defaultBranchRef: {
    readonly id: string
    readonly name: string
  }
  readonly configYml?: {
    readonly text: string
  }
  readonly configYaml?: {
    readonly text: string
  }
  readonly branches: GitHubRepositoryRef[]
  readonly tags: GitHubRepositoryRef[]
}

export type GitHubRepositoryRef = {
  readonly id: string
  readonly name: string  
  readonly baseRef?: string 
  readonly files: {
    readonly name: string
  }[]
}

export default interface IGitHubRepositoryDataSource {
  getRepositories(): Promise<GitHubRepository[]>
}

export default interface IGitHubRepositoryDataSource {
  getRepositories(): Promise<GitHubRepository[]>
}
