import { z } from "zod"
import IAccessTokenService from "@/features/auth/domain/IAccessTokenService"
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
  private readonly accessTokenService: IAccessTokenService
  private readonly gitHubClient: IGitHubClient
  
  constructor(
    accessTokenService: IAccessTokenService,
    gitHubClient: IGitHubClient
  ) {
    this.accessTokenService = accessTokenService
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
    try {
      return await fn()
    } catch (e) {
      try {
        const error = HttpErrorSchema.parse(e)
        if (error.status == 401) {
          // Refresh access token and try the request one last time.
          console.log("🚫 Received authentication error")
          await this.accessTokenService.refreshAccessToken()
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
