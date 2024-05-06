import { z } from "zod"
import IGitHubClient, {
  GraphQLQueryRequest,
  GraphQlQueryResponse,
  GetRepositoryContentRequest,
  GetPullRequestCommentsRequest,
  GetOrganizationMembershipStatusRequest,
  GetOrganizationMembershipStatusRequestResponse,
  AddCommentToPullRequestRequest,
  RepositoryContent,
  PullRequestComment
} from "./IGitHubClient"

const HttpErrorSchema = z.object({
  status: z.number()
})

interface IGitHubAccessTokenDataSource {
  getAccessToken(): Promise<string>
}

interface IGitHubAccessTokenRefresher {
  refreshAccessToken(accessToken: string): Promise<string>
}

export default class AccessTokenRefreshingGitHubClient implements IGitHubClient {
  private readonly accessTokenDataSource: IGitHubAccessTokenDataSource
  private readonly accessTokenRefresher: IGitHubAccessTokenRefresher
  private readonly gitHubClient: IGitHubClient
  
  constructor(
    config: {
      accessTokenDataSource: IGitHubAccessTokenDataSource
      accessTokenRefresher: IGitHubAccessTokenRefresher
      gitHubClient: IGitHubClient
    }
  ) {
    this.accessTokenDataSource = config.accessTokenDataSource
    this.accessTokenRefresher = config.accessTokenRefresher
    this.gitHubClient = config.gitHubClient
  }
  
  async graphql(request: GraphQLQueryRequest): Promise<GraphQlQueryResponse> {
    return await this.send(async () => {
      return await this.gitHubClient.graphql(request)
    })
  }
  
  async getRepositoryContent(request: GetRepositoryContentRequest): Promise<RepositoryContent> {
    return await this.send(async () => {
      return await this.gitHubClient.getRepositoryContent(request)
    })
  }
  
  async getPullRequestComments(request: GetPullRequestCommentsRequest): Promise<PullRequestComment[]> {
    return await this.send(async () => {
      return await this.gitHubClient.getPullRequestComments(request)
    })
  }
  
  async addCommentToPullRequest(request: AddCommentToPullRequestRequest): Promise<void> {
    return await this.send(async () => {
      return await this.gitHubClient.addCommentToPullRequest(request)
    })
  }
  
  async getOrganizationMembershipStatus(
    request: GetOrganizationMembershipStatusRequest
  ): Promise<GetOrganizationMembershipStatusRequestResponse> {
    return await this.send(async () => {
      return await this.gitHubClient.getOrganizationMembershipStatus(request)
    })
  }
  
  private async send<T>(fn: () => Promise<T>): Promise<T> {
    const accessToken = await this.accessTokenDataSource.getAccessToken()
    try {
      return await fn()
    } catch (e) {
      try {
        const error = HttpErrorSchema.parse(e)
        if (error.status == 401) {
          // Refresh access token and try the request one last time.
          await this.accessTokenRefresher.refreshAccessToken(accessToken)
          return await fn()
        } else {
          // Not an error we can handle so forward it.
          throw e
        }
      } catch {
        // Forward the original error if schema validation fails.
        throw e
      }
    }
  }
}
