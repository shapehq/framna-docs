import { Octokit } from "octokit"
import { createAppAuth } from "@octokit/auth-app"
import IPullRequestCommentRepository, {
  PullRequestComment,
  GetPullRequestCommentsOperation,
  AddPullRequestCommentOperation
} from "../domain/IPullRequestCommentRepository"

export type GitHubPullRequestCommentRepositoryConfig = {
  appId: string,
  privateKey: string,
  clientId: string,
  clientSecret: string
}

type InstallationAuthenticator = (installationId: number) => Promise<{token: string}>

export default class GitHubPullRequestCommentRepository implements IPullRequestCommentRepository {
  readonly auth: InstallationAuthenticator
  
  constructor(config: GitHubPullRequestCommentRepositoryConfig) {
    const appAuth = createAppAuth(config)
    this.auth = async (installationId: number) => {
      return await appAuth({ type: "installation", installationId })
    }
  }
  
  async getComments(
    operation: GetPullRequestCommentsOperation
  ): Promise<PullRequestComment[]> {
    const installationAuthentication = await this.auth(operation.appInstallationId)
    const octokit = new Octokit({ auth: installationAuthentication.token })
    const comments = await octokit.paginate(octokit.rest.issues.listComments, {
      owner: operation.repositoryOwner,
      repo: operation.repositoryName,
      issue_number: operation.pullRequestNumber,
    })
    let result: PullRequestComment[] = []
    for await (const comment of comments) {
      result.push({
        body: comment.body || "",
        isFromBot: comment.user?.type == "Bot"
      })
    }
    return result
  }
  
  async addComment(operation: AddPullRequestCommentOperation): Promise<void> {
    const installationAuthentication = await this.auth(operation.appInstallationId)
    const octokit = new Octokit({ auth: installationAuthentication.token })
    await octokit.rest.issues.createComment({
      owner: operation.repositoryOwner,
      repo: operation.repositoryName,
      issue_number: operation.pullRequestNumber,
      body: operation.body
    })
  }
}
