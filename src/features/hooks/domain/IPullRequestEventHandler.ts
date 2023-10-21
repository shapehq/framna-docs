export interface IPullRequestOpenedEvent {
  readonly appInstallationId: number
  readonly repositoryOwner: string
  readonly repositoryName: string
  readonly ref: string
  readonly pullRequestNumber: number
}

export default interface IPullRequestEventHandler {
  pullRequestOpened(event: IPullRequestOpenedEvent): Promise<void>
}
