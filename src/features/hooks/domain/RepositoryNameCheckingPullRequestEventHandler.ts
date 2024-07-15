import IPullRequestEventHandler, { IPullRequestOpenedEvent } from "./IPullRequestEventHandler"

export default class RepositoryNameCheckingPullRequestEventHandler implements IPullRequestEventHandler {
  private readonly eventHandler: IPullRequestEventHandler
  private readonly repositoryNameSuffix: string
  private readonly allowedRepositoryNames: string[]
  private readonly disallowedRepositoryNames: string[]
  
  constructor(config: {
    eventHandler: IPullRequestEventHandler,
    repositoryNameSuffix: string,
    allowedRepositoryNames?: string[],
    disallowedRepositoryNames?: string[]
  }) {
    this.eventHandler = config.eventHandler
    this.repositoryNameSuffix = config.repositoryNameSuffix
    this.allowedRepositoryNames = config.allowedRepositoryNames || []
    this.disallowedRepositoryNames = config.disallowedRepositoryNames || []
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
    return repositoryName.endsWith(this.repositoryNameSuffix)
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
