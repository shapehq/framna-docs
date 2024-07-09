export type GraphQLQueryRequest = {
  readonly query: string
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  readonly variables?: {[key: string]: any}
}

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

export type GetRepositoryContentRequest = {
  readonly repositoryOwner: string
  readonly repositoryName: string
  readonly path: string
  readonly ref: string | undefined
}

export type GetPullRequestCommentsRequest = {
  readonly appInstallationId: number
  readonly repositoryOwner: string
  readonly repositoryName: string
  readonly pullRequestNumber: number
}

export type AddCommentToPullRequestRequest = {
  readonly appInstallationId: number
  readonly repositoryOwner: string
  readonly repositoryName: string
  readonly pullRequestNumber: number
  readonly body: string
}

export type GetOrganizationMembershipStatusRequest = {
  readonly organizationName: string
}

export type GetOrganizationMembershipStatusRequestResponse = {
  readonly state: "active" | "pending"
}

export default interface IGitHubClient {
  graphql(request: GraphQLQueryRequest): Promise<GraphQlQueryResponse>
  getRepositoryContent(request: GetRepositoryContentRequest): Promise<RepositoryContent>
  getPullRequestComments(request: GetPullRequestCommentsRequest): Promise<PullRequestComment[]>
  addCommentToPullRequest(request: AddCommentToPullRequestRequest): Promise<void>
  getOrganizationMembershipStatus(request: GetOrganizationMembershipStatusRequest): Promise<GetOrganizationMembershipStatusRequestResponse>
}
