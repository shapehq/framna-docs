import { NextRequest } from "next/server"
import { Webhooks, EmitterWebhookEventName } from "@octokit/webhooks"
import IPullRequestEventHandler from "../domain/IPullRequestEventHandler"

interface GitHubHookHandlerConfig {
  readonly secret: string
  readonly pullRequestEventHandler: IPullRequestEventHandler
}

class GitHubHookHandler {
  private readonly webhooks: Webhooks
  private readonly pullRequestEventHandler: IPullRequestEventHandler
  
  constructor(config: GitHubHookHandlerConfig) {
    this.webhooks = new Webhooks({ secret: config.secret })
    this.pullRequestEventHandler = config.pullRequestEventHandler
    this.registerEventHandlers()
  }
  
  async handle(req: NextRequest): Promise<void> {
    await this.webhooks.verifyAndReceive({
      id: req.headers.get('X-GitHub-Delivery') as string,
      name: req.headers.get('X-GitHub-Event') as EmitterWebhookEventName,
      payload: await req.text(),
      signature: req.headers.get('X-Hub-Signature') as string,
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
      await this.pullRequestEventHandler.pullRequestOpened({
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
      await this.pullRequestEventHandler.pullRequestOpened({
        appInstallationId: payload.installation.id,
        repositoryOwner: payload.repository.owner.login,
        repositoryName: payload.repository.name,
        ref: payload.pull_request.head.ref,
        pullRequestNumber: payload.pull_request.number
      })
    })
  }
}

export default GitHubHookHandler
