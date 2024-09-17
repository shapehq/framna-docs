import { NextRequest } from "next/server"
import { Webhooks } from "@octokit/webhooks"
import { IPullRequestEventHandler } from "../domain"

interface GitHubHookHandlerConfig {
  readonly secret: string
  readonly pullRequestEventHandler: IPullRequestEventHandler
}

export default class GitHubHookHandler {
  private readonly webhooks: Webhooks
  private readonly pullRequestEventHandler: IPullRequestEventHandler
  private hostURL: string | undefined
  
  constructor(config: GitHubHookHandlerConfig) {
    this.webhooks = new Webhooks({ secret: config.secret })
    this.pullRequestEventHandler = config.pullRequestEventHandler
    this.registerEventHandlers()
  }
  
  async handle(req: NextRequest): Promise<void> {
    const url = new URL(req.url)
    this.hostURL = `${url.protocol}//${url.hostname}${url.port ? ":" + url.port : ""}`
    await this.webhooks.verifyAndReceive({
      id: req.headers.get("X-GitHub-Delivery") as string,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      name: req.headers.get("X-GitHub-Event") as any,
      payload: await req.text(),
      signature: req.headers.get("X-Hub-Signature-256") as string,
    }).catch((error) => {
      console.error(`Error: ${error.message}`)
      return false
    })
  }
  
  private registerEventHandlers() {
    this.webhooks.on("pull_request.opened", async ({ payload }) => {
      if (!payload.installation) {
        throw new Error("Payload does not contain information about the app installation.")
      }
      if (!this.hostURL) {
        throw new Error("hostURL was not stored as part of the webhook request.")
      }
      await this.pullRequestEventHandler.pullRequestOpened({
        hostURL: this.hostURL,
        appInstallationId: payload.installation.id,
        repositoryOwner: payload.repository.owner.login,
        repositoryName: payload.repository.name,
        ref: payload.pull_request.head.ref,
        pullRequestNumber: payload.pull_request.number
      })
    })
    this.webhooks.on("pull_request.reopened", async ({ payload }) => {
      if (!payload.installation) {
        throw new Error("Payload does not contain information about the app installation.")
      }
      if (!this.hostURL) {
        throw new Error("hostURL was not stored as part of the webhook request.")
      }
      await this.pullRequestEventHandler.pullRequestReopened({
        hostURL: this.hostURL,
        appInstallationId: payload.installation.id,
        repositoryOwner: payload.repository.owner.login,
        repositoryName: payload.repository.name,
        ref: payload.pull_request.head.ref,
        pullRequestNumber: payload.pull_request.number
      })
    })
    this.webhooks.on("pull_request.synchronize", async ({ payload }) => {
      if (!payload.installation) {
        throw new Error("Payload does not contain information about the app installation.")
      }
      if (!this.hostURL) {
        throw new Error("hostURL was not stored as part of the webhook request.")
      }
      await this.pullRequestEventHandler.pullRequestSynchronized({
        hostURL: this.hostURL,
        appInstallationId: payload.installation.id,
        repositoryOwner: payload.repository.owner.login,
        repositoryName: payload.repository.name,
        ref: payload.pull_request.head.ref,
        pullRequestNumber: payload.pull_request.number
      })
    })
  }
}
