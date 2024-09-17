export interface IPullRequestOpenedEvent {
  readonly hostURL: string
  readonly appInstallationId: number
  readonly repositoryOwner: string
  readonly repositoryName: string
  readonly ref: string
  readonly pullRequestNumber: number
}

export interface IPullRequestReopenedEvent {
  readonly hostURL: string
  readonly appInstallationId: number
  readonly repositoryOwner: string
  readonly repositoryName: string
  readonly ref: string
  readonly pullRequestNumber: number
}

export interface IPullRequestSynchronizedEvent {
  readonly hostURL: string
  readonly appInstallationId: number
  readonly repositoryOwner: string
  readonly repositoryName: string
  readonly ref: string
  readonly pullRequestNumber: number
}

export default interface IPullRequestEventHandler {
  pullRequestOpened(event: IPullRequestOpenedEvent): Promise<void>
  pullRequestReopened(event: IPullRequestReopenedEvent): Promise<void>
  pullRequestSynchronized(event: IPullRequestSynchronizedEvent): Promise<void>
}
