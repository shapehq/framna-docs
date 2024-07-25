export type GitHubRepository = {
  readonly name: string
  readonly owner: {
    readonly login: string
  }
  readonly defaultBranchRef: {
    readonly name: string
    readonly target: {
      readonly oid: string
    }
  }
  readonly configYml?: {
    readonly text: string
  }
  readonly configYaml?: {
    readonly text: string
  }
  readonly branches: EdgesContainer<GitHubRepositoryRef>
  readonly tags: EdgesContainer<GitHubRepositoryRef>
}

type EdgesContainer<T> = {
  readonly edges: Edge<T>[]
}

type Edge<T> = {
  readonly node: T
}

export type GitHubRepositoryRef = {
  readonly name: string
  readonly target: {
    readonly oid: string
    readonly tree: {
      readonly entries: GitHubRepositoryFile[]
    }
  }
}

export type GitHubRepositoryFile = {
  readonly name: string
}

export default interface IGitHubRepositoryDataSource {
  getRepositories(): Promise<GitHubRepository[]>
}
