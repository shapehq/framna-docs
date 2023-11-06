import { Octokit } from "octokit"
import { createAppAuth } from "@octokit/auth-app"
import IGitHubClient, {
  GraphQLQueryRequest,
  GraphQlQueryResponse,
  GetRepositoryContentRequest,
  GetPullRequestCommentsRequest,
  AddCommentToPullRequestRequest,
  GetOrganizationMembershipStatusRequest,
  RepositoryContent,
  PullRequestComment,
  OrganizationMembershipStatus
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
  
  async graphql(request: GraphQLQueryRequest): Promise<GraphQlQueryResponse> {
    const accessToken = await this.accessTokenReader.getAccessToken()
    const octokit = new Octokit({ auth: accessToken })
    return await octokit.graphql(request.query, request.variables)
  }
  
  async getRepositoryContent(request: GetRepositoryContentRequest): Promise<RepositoryContent> {
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
  ): Promise<OrganizationMembershipStatus> {
    const accessToken = await this.accessTokenReader.getAccessToken()
    const octokit = new Octokit({ auth: accessToken })
    try {
      const response = await octokit.rest.orgs.getMembershipForAuthenticatedUser({
        org: request.organizationName
      })
      if (response.data.state == "active") {
        return OrganizationMembershipStatus.ACTIVE
      } else if (response.data.state == "pending") {
        return OrganizationMembershipStatus.PENDING
      } else {
        return OrganizationMembershipStatus.UNKNOWN
      }
    } catch (error: any) {
      if (error.status) {
        if (error.status == 404) {
          return OrganizationMembershipStatus.NOT_A_MEMBER
        } else if (error.status == 403) {
          return OrganizationMembershipStatus.GITHUB_APP_BLOCKED
        } else  {
          throw error
        }
      } else {
        throw error
      }
    }
  }
}
