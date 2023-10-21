import IPullRequestEventHandler, { IPullRequestOpenedEvent } from "./IPullRequestEventHandler"

export default class RepositoryNameCheckingPullRequestEventHandler implements IPullRequestEventHandler {
  private readonly eventHandler: IPullRequestEventHandler
  private readonly allowedRepositoryNames: string[]
  private readonly disallowedRepositoryNames: string[]
  
  constructor(
    eventHandler: IPullRequestEventHandler,
    allowedRepositoryNames?: string[],
    disallowedRepositoryNames?: string[]
  ) {
    this.eventHandler = eventHandler
    this.allowedRepositoryNames = allowedRepositoryNames || []
    this.disallowedRepositoryNames = disallowedRepositoryNames || []
  }
  
  async pullRequestOpened(event: IPullRequestOpenedEvent): Promise<void> {
    if (!event.repositoryName.match(/-openapi$/)) {
      return
    }
    if (
      this.allowedRepositoryNames.length != 0 &&
      !this.allowedRepositoryNames.includes(event.repositoryName)
    ) {
      return
    }
    if (this.disallowedRepositoryNames.includes(event.repositoryName)) {
      return
    }
    return await this.eventHandler.pullRequestOpened(event)
  }
}
