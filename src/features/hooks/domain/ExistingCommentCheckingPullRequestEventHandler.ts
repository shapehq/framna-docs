import IPullRequestEventHandler, { IPullRequestOpenedEvent } from "./IPullRequestEventHandler"
import IPullRequestCommentRepository from "./IPullRequestCommentRepository"

export default class ExistingCommentCheckingPullRequestEventHandler implements IPullRequestEventHandler {
  private readonly eventHandler: IPullRequestEventHandler
  private readonly commentRepository: IPullRequestCommentRepository
  private readonly gitHubAppId: string
  
  constructor(config: {
    eventHandler: IPullRequestEventHandler,
    commentRepository: IPullRequestCommentRepository,
    gitHubAppId: string
  }) {
    this.eventHandler = config.eventHandler
    this.commentRepository = config.commentRepository
    this.gitHubAppId = config.gitHubAppId
  }
  
  async pullRequestOpened(event: IPullRequestOpenedEvent): Promise<void> {
    const comments = await this.commentRepository.getComments(event)
    const ourComment = comments.find(comment => {
      return comment.isFromBot && comment.gitHubApp?.id == this.gitHubAppId
    })
    const containsOurComment = ourComment !== undefined
    if (containsOurComment) {
      return
    }
    await this.eventHandler.pullRequestOpened(event)
  }
}
