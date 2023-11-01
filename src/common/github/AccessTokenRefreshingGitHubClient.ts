import { z } from "zod"
import IOAuthTokenService from "@/features/auth/domain/IOAuthTokenService"
import IGitHubClient, {
  GraphQLQueryRequest,
  GraphQlQueryResponse,
  GetRepositoryContentRequest,
  GetPullRequestCommentsRequest,
  AddCommentToPullRequestRequest,
  RepositoryContent,
  PullRequestComment
} from "./IGitHubClient"

const HttpErrorSchema = z.object({
  status: z.number()
})

export default class AccessTokenRefreshingGitHubClient implements IGitHubClient {
  private readonly oAuthTokenService: IOAuthTokenService
  private readonly gitHubClient: IGitHubClient
  
  constructor(
    oAuthTokenService: IOAuthTokenService,
    gitHubClient: IGitHubClient
  ) {
    this.oAuthTokenService = oAuthTokenService
    this.gitHubClient = gitHubClient
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
  
  private async send<T>(fn: () => Promise<T>): Promise<T> {
    const authToken = await this.oAuthTokenService.getOAuthToken()
    try {
      return await fn()
    } catch (e) {
      try {
        const error = HttpErrorSchema.parse(e)
        if (error.status == 401) {
          // Refresh access token and try the request one last time.
          await this.oAuthTokenService.refreshOAuthToken(authToken.refreshToken)
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
