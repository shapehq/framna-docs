import { Octokit } from "octokit"
import { createAppAuth } from "@octokit/auth-app"
import IGitHubClient, {
  GraphQlQueryResponse,
  RepositoryContent,
  PullRequestComment
} from "./IGitHubClient"

type GitHubClientConfig = {
  readonly appId: string
  readonly clientId: string
  readonly clientSecret: string
  readonly privateKey: string
  readonly accessTokenReader: IGitHubAccessTokenReader
}

interface IGitHubAccessTokenReader {
  getAccessToken(): Promise<string>
}

type GitHubContentItem = {download_url: string}

type InstallationAuthenticator = (installationId: number) => Promise<{token: string}>

export default class GitHubClient implements IGitHubClient {
  private readonly accessTokenReader: IGitHubAccessTokenReader
  private readonly installationAuthenticator: InstallationAuthenticator
  
  constructor(config: GitHubClientConfig) {
    this.accessTokenReader = config.accessTokenReader
    const appAuth = createAppAuth({
      appId: config.appId,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      privateKey: config.privateKey
    })
    this.installationAuthenticator = async (installationId: number) => {
      return await appAuth({ type: "installation", installationId })
    }
  }
  
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  async graphql(query: string, variables: { [key: string]: any }): Promise<GraphQlQueryResponse> {
    const accessToken = await this.accessTokenReader.getAccessToken()
    const octokit = new Octokit({ auth: accessToken })
    return await octokit.graphql(query, variables)
  }
  
  async getRepositoryContent(
    request: {
      repositoryOwner: string
      repositoryName: string
      path: string
      ref: string | undefined
    }
  ): Promise<RepositoryContent> {
    const accessToken = await this.accessTokenReader.getAccessToken()
    const octokit = new Octokit({ auth: accessToken })
    const response = await octokit.rest.repos.getContent({
      owner: request.repositoryOwner,
      repo: request.repositoryName,
      path: request.path,
      ref: request.ref
    })
    const item = response.data as GitHubContentItem
    return { downloadURL: item.download_url }
  }
  
  async getPullRequestComments(
    request: {
      appInstallationId: number
      repositoryOwner: string
      repositoryName: string
      pullRequestNumber: number
    }
  ): Promise<PullRequestComment[]> {
    const auth = await this.installationAuthenticator(request.appInstallationId)
    const octokit = new Octokit({ auth: auth.token })
    const comments = await octokit.paginate(octokit.rest.issues.listComments, {
      owner: request.repositoryOwner,
      repo: request.repositoryName,
      issue_number: request.pullRequestNumber,
    })
    const result: PullRequestComment[] = []
    for await (const comment of comments) {
      result.push({
        body: comment.body || "",
        isFromBot: comment.user?.type == "Bot"
      })
    }
    return result
  }
  
  async addCommentToPullRequest(
    request: {
      appInstallationId: number
      repositoryOwner: string
      repositoryName: string
      pullRequestNumber: number
      body: string
    }
  ): Promise<void> {
    const auth = await this.installationAuthenticator(request.appInstallationId)
    const octokit = new Octokit({ auth: auth.token })
    await octokit.rest.issues.createComment({
      owner: request.repositoryOwner,
      repo: request.repositoryName,
      issue_number: request.pullRequestNumber,
      body: request.body
    })
  }
}
