import IGitHubClient from "@/common/github/IGitHubClient"
import IPullRequestCommentRepository, {
  GetPullRequestCommentsOperation,
  AddPullRequestCommentOperation,
  PullRequestComment
} from "../domain/IPullRequestCommentRepository"

export default class GitHubPullRequestCommentRepository implements IPullRequestCommentRepository {
  readonly gitHubClient: IGitHubClient
  
  constructor(gitHubClient: IGitHubClient) {
    this.gitHubClient = gitHubClient
  }
  
  async getComments(
    operation: GetPullRequestCommentsOperation
  ): Promise<PullRequestComment[]> {
    return await this.gitHubClient.getPullRequestComments({
      appInstallationId: operation.appInstallationId,
      repositoryOwner: operation.repositoryOwner,
      repositoryName: operation.repositoryName,
      pullRequestNumber: operation.pullRequestNumber,
    })
  }
  
  async addComment(operation: AddPullRequestCommentOperation): Promise<void> {
    await this.gitHubClient.addCommentToPullRequest({
      appInstallationId: operation.appInstallationId,
      repositoryOwner: operation.repositoryOwner,
      repositoryName: operation.repositoryName,
      pullRequestNumber: operation.pullRequestNumber,
      body: operation.body
    })
  }
}
