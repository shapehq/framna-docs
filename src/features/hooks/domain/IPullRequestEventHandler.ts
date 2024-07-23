export interface IPullRequestOpenedEvent {
  readonly appInstallationId: number
  readonly repositoryOwner: string
  readonly repositoryName: string
  readonly ref: string
  readonly pullRequestNumber: number
}

export interface IPullRequestReopenedEvent {
  readonly appInstallationId: number
  readonly repositoryOwner: string
  readonly repositoryName: string
  readonly ref: string
  readonly pullRequestNumber: number
}

export interface IPullRequestSynchronizedEvent {
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
