export type PullRequestComment = {
  readonly isFromBot: boolean
  readonly body: string
}

export type GetPullRequestCommentsOperation = {
  readonly appInstallationId: number
  readonly repositoryOwner: string
  readonly repositoryName: string
  readonly pullRequestNumber: number
}

export type AddPullRequestCommentOperation = {
  readonly appInstallationId: number
  readonly repositoryOwner: string
  readonly repositoryName: string
  readonly pullRequestNumber: number
  readonly body: string
}

export default interface IPullRequestCommentRepository {
  getComments(operation: GetPullRequestCommentsOperation): Promise<PullRequestComment[]>
  addComment(operation: AddPullRequestCommentOperation): Promise<void>
}
