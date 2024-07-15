import IPullRequestEventHandler, {
  IPullRequestOpenedEvent,
  IPullRequestReopenedEvent,
  IPullRequestSynchronizedEvent
} from "./IPullRequestEventHandler"

interface IPullRequestCommenter {
  commentPullRequest(request: {
    appInstallationId: number
    repositoryOwner: string
    repositoryName: string
    ref: string
    pullRequestNumber: number
  }): Promise<void>
}

export default class PostCommentPullRequestEventHandler implements IPullRequestEventHandler {
  private readonly pullRequestCommenter: IPullRequestCommenter
  
  constructor(config: { pullRequestCommenter: IPullRequestCommenter }) {
    this.pullRequestCommenter = config.pullRequestCommenter
  }
  
  async pullRequestOpened(event: IPullRequestOpenedEvent): Promise<void> {
    await this.pullRequestCommenter.commentPullRequest(event)
  }
  
  async pullRequestReopened(event: IPullRequestReopenedEvent) {
    await this.pullRequestCommenter.commentPullRequest(event)
  }
  
  async pullRequestSynchronized(event: IPullRequestSynchronizedEvent) {
    await this.pullRequestCommenter.commentPullRequest(event)
  }
}