import IPullRequestEventHandler, { IPullRequestOpenedEvent } from "./IPullRequestEventHandler"
import IPullRequestCommentRepository from "./IPullRequestCommentRepository"

export default class ExistingCommentCheckingPullRequestEventHandler implements IPullRequestEventHandler {
  private readonly eventHandler: IPullRequestEventHandler
  private readonly commentRepository: IPullRequestCommentRepository
  private readonly needleDomain: string
  
  constructor(
    eventHandler: IPullRequestEventHandler,
    commentRepository: IPullRequestCommentRepository,
    needleDomain: string
   ) {
    this.eventHandler = eventHandler
    this.commentRepository = commentRepository
    this.needleDomain = needleDomain
  }
  
  async pullRequestOpened(event: IPullRequestOpenedEvent): Promise<void> {
    const comments = await this.commentRepository.getComments(event)
    const containsOurComment = comments.find(comment => {
      return comment.isFromBot && comment.body.includes(this.needleDomain)
    })
    if (containsOurComment) {
      return
    }
    await this.eventHandler.pullRequestOpened(event)
  }
}
