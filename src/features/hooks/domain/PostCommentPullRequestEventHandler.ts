import IPullRequestEventHandler, { IPullRequestOpenedEvent } from "./IPullRequestEventHandler"
import IPullRequestCommentRepository from "./IPullRequestCommentRepository"
import GitHubCommentFactory from "./GitHubCommentFactory"

export default class PostCommentPullRequestEventHandler implements IPullRequestEventHandler {
  private readonly commentRepository: IPullRequestCommentRepository
  private readonly domain: string
  
  constructor(
    commentRepository: IPullRequestCommentRepository,
    domain: string
  ) {
    this.commentRepository = commentRepository
    this.domain = domain
  }
  
  async pullRequestOpened(event: IPullRequestOpenedEvent): Promise<void> {
    const projectId = event.repositoryName.replace(/-openapi$/, "")
    const link = `${this.domain}/${projectId}/${event.ref}`
    const commentBody = GitHubCommentFactory.makeDocumentationPreviewReadyComment(link)
    await this.commentRepository.addComment({
      appInstallationId: event.appInstallationId,
      repositoryOwner: event.repositoryOwner,
      repositoryName: event.repositoryName,
      pullRequestNumber: event.pullRequestNumber,
      body: commentBody
    })
  }
}
