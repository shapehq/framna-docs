export type GraphQlQueryResponse = {
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  readonly [key: string]: any
}

export type RepositoryContent = {
  readonly downloadURL: string
}

export type PullRequestComment = {
  readonly isFromBot: boolean
  readonly body: string
}

export default interface IGitHubClient {
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  graphql(query: string, variables: {[key: string]: any}): Promise<GraphQlQueryResponse>
  getRepositoryContent(request: {
    repositoryOwner: string,
    repositoryName: string,
    path: string,
    ref: string | undefined
  }): Promise<RepositoryContent>
  getPullRequestComments(request: {
    appInstallationId: number
    repositoryOwner: string
    repositoryName: string
    pullRequestNumber: number
  }): Promise<PullRequestComment[]>
  addCommentToPullRequest(request: {
    appInstallationId: number
    repositoryOwner: string
    repositoryName: string
    pullRequestNumber: number
    body: string
  }): Promise<void>
}
