import { z } from "zod"
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

interface IGitHubAccessTokenReader {
  getAccessToken(): Promise<string>
}

interface IGitHubAccessTokenRefresher {
  refreshAccessToken(accessToken: string): Promise<string>
}

export default class AccessTokenRefreshingGitHubClient implements IGitHubClient {
  private readonly accessTokenReader: IGitHubAccessTokenReader
  private readonly accessTokenRefresher: IGitHubAccessTokenRefresher
  private readonly gitHubClient: IGitHubClient
  
  constructor(
    accessTokenReader: IGitHubAccessTokenReader,
    accessTokenRefresher: IGitHubAccessTokenRefresher,
    gitHubClient: IGitHubClient
  ) {
    this.accessTokenReader = accessTokenReader
    this.accessTokenRefresher = accessTokenRefresher
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
    const accessToken = await this.accessTokenReader.getAccessToken()
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
