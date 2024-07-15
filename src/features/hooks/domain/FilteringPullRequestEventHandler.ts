import IPullRequestEventHandler, {
  IPullRequestOpenedEvent,
  IPullRequestReopenedEvent,
  IPullRequestSynchronizedEvent
} from "./IPullRequestEventHandler"

interface IFilter {
  includeEvent(event: { repositoryOwner: string, repositoryName: string }): boolean
}

export default class FilteringPullRequestEventHandler implements IPullRequestEventHandler {
  private readonly filter: IFilter
  private readonly eventHandler: IPullRequestEventHandler
  
  constructor(config: { filter: IFilter, eventHandler: IPullRequestEventHandler }) {
    this.filter = config.filter
    this.eventHandler = config.eventHandler
  }
  
  async pullRequestOpened(event: IPullRequestOpenedEvent) {
    if (this.filter.includeEvent(event)) {
      await this.eventHandler.pullRequestOpened(event)
    }
  }
  
  async pullRequestReopened(event: IPullRequestReopenedEvent) {
    if (this.filter.includeEvent(event)) {
      await this.eventHandler.pullRequestReopened(event)
    }
  }
  
  async pullRequestSynchronized(event: IPullRequestSynchronizedEvent) {
    if (this.filter.includeEvent(event)) {
      await this.eventHandler.pullRequestSynchronized(event)
    }
  }
}
