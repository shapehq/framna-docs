import { Octokit } from "octokit"
import { createAppAuth } from "@octokit/auth-app"
import IGitHubClient, {
  GraphQLQueryRequest,
  GraphQlQueryResponse,
  GetRepositoryContentRequest,
  GetPullRequestCommentsRequest,
  AddCommentToPullRequestRequest,
  GetOrganizationMembershipStatusRequest,
  GetOrganizationMembershipStatusRequestResponse,
  RepositoryContent,
  PullRequestComment
} from "./IGitHubClient"

interface IGitHubAccessTokenDataSource {
  getAccessToken(): Promise<string>
}

type GitHubContentItem = {download_url: string}

type InstallationAuthenticator = (installationId: number) => Promise<{token: string}>

export default class GitHubClient implements IGitHubClient {
  private readonly accessTokenDataSource: IGitHubAccessTokenDataSource
  private readonly installationAuthenticator: InstallationAuthenticator
  
  constructor(
    config: {
      appId: string
      clientId: string
      clientSecret: string
      privateKey: string
      accessTokenDataSource: IGitHubAccessTokenDataSource
    }
  ) {
    this.accessTokenDataSource = config.accessTokenDataSource
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
  
  async graphql(request: GraphQLQueryRequest): Promise<GraphQlQueryResponse> {
    const accessToken = await this.accessTokenDataSource.getAccessToken()
    const octokit = new Octokit({ auth: accessToken })
    return await octokit.graphql(request.query, request.variables)
  }
  
  async getRepositoryContent(request: GetRepositoryContentRequest): Promise<RepositoryContent> {
    const accessToken = await this.accessTokenDataSource.getAccessToken()
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
  
  async getPullRequestComments(request: GetPullRequestCommentsRequest): Promise<PullRequestComment[]> {
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
  
  async addCommentToPullRequest(request: AddCommentToPullRequestRequest): Promise<void> {
    const auth = await this.installationAuthenticator(request.appInstallationId)
    const octokit = new Octokit({ auth: auth.token })
    await octokit.rest.issues.createComment({
      owner: request.repositoryOwner,
      repo: request.repositoryName,
      issue_number: request.pullRequestNumber,
      body: request.body
    })
  }
  
  async getOrganizationMembershipStatus(
    request: GetOrganizationMembershipStatusRequest
  ): Promise<GetOrganizationMembershipStatusRequestResponse> {
    const accessToken = await this.accessTokenDataSource.getAccessToken()
    const octokit = new Octokit({ auth: accessToken })
    const response = await octokit.rest.orgs.getMembershipForAuthenticatedUser({
      org: request.organizationName
    })
    return { state: response.data.state }
  }
}
