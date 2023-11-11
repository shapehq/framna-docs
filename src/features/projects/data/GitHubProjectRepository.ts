type GitHubProjectRepository = {
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
  readonly branches: EdgesContainer<GitHubProjectRepositoryRef>
  readonly tags: EdgesContainer<GitHubProjectRepositoryRef>
}

export default GitHubProjectRepository

type EdgesContainer<T> = {
  readonly edges: Edge<T>[]
}

type Edge<T> = {
  readonly node: T
}

export type GitHubProjectRepositoryRef = {
  readonly name: string
  readonly target: {
    readonly oid: string
    readonly tree: {
      readonly entries: GitHubProjectRepositoryFile[]
    }
  }
}

export type GitHubProjectRepositoryFile = {
  readonly name: string
}