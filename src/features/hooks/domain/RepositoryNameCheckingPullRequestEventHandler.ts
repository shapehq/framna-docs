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
    if (!this.repositoryNameHasExpectedSuffix(event.repositoryName)) {
      return
    }
    if (!this.isAllowedRepositoryName(event.repositoryName)) {
      return
    }
    if (this.isDisallowedRepositoryName(event.repositoryName)) {
      return
    }
    return await this.eventHandler.pullRequestOpened(event)
  }
  
  private repositoryNameHasExpectedSuffix(repositoryName: string) {
    return repositoryName.match(/-openapi$/)
  }
  
  private isAllowedRepositoryName(repositoryName: string) {
    if (this.allowedRepositoryNames.length == 0) {
      return true
    }
    return this.allowedRepositoryNames.includes(repositoryName)
  }
  
  private isDisallowedRepositoryName(repositoryName: string) {
    return this.disallowedRepositoryNames.includes(repositoryName)
  }
}
