import IPullRequestEventHandler, { IPullRequestOpenedEvent } from "./IPullRequestEventHandler"
import IPullRequestCommentRepository from "./IPullRequestCommentRepository"
import IGitHubCommentFactory from "./IGitHubCommentFactory"

export default class PostCommentPullRequestEventHandler implements IPullRequestEventHandler {
  private readonly commentRepository: IPullRequestCommentRepository
  private readonly commentFactory: IGitHubCommentFactory
  
  constructor(config: {
    commentRepository: IPullRequestCommentRepository,
    commentFactory: IGitHubCommentFactory
  }) {
    this.commentRepository = config.commentRepository
    this.commentFactory = config.commentFactory
  }
  
  async pullRequestOpened(event: IPullRequestOpenedEvent): Promise<void> {
    const commentBody = this.commentFactory.makeDocumentationPreviewReadyComment({
      owner: event.repositoryOwner,
      repositoryName: event.repositoryName,
      ref: event.ref
    })
    await this.commentRepository.addComment({
      appInstallationId: event.appInstallationId,
      repositoryOwner: event.repositoryOwner,
      repositoryName: event.repositoryName,
      pullRequestNumber: event.pullRequestNumber,
      body: commentBody
    })
  }
}
