import { Octokit } from "octokit"
import IGitHubClient, {
  GraphQLQueryRequest,
  GraphQlQueryResponse,
  GetRepositoryContentRequest,
  RepositoryContent,
  GetPullRequestFilesRequest,
  PullRequestFile,
  GetPullRequestCommentsRequest,
  PullRequestComment,
  AddCommentToPullRequestRequest,
  UpdatePullRequestCommentRequest,
  CompareCommitsRequest,
  CompareCommitsResponse,
} from "@/common/github/IGitHubClient"
import { IOAuthTokenRefresher } from "@/features/auth/domain"
import { ICLISessionStore } from "./ICLISessionStore"
import { CLISession } from "./CLISession"

type GitHubContentItem = { download_url: string }

interface TokenRefreshingCLIGitHubClientConfig {
  session: CLISession
  sessionStore: ICLISessionStore
  tokenRefresher: IOAuthTokenRefresher
}

/**
 * GitHub client for CLI that automatically refreshes expired tokens.
 * When a 401 error is received, it refreshes the token, updates the session,
 * and retries the request.
 */
export class TokenRefreshingCLIGitHubClient implements IGitHubClient {
  private octokit: Octokit
  private session: CLISession
  private readonly sessionStore: ICLISessionStore
  private readonly tokenRefresher: IOAuthTokenRefresher

  constructor(config: TokenRefreshingCLIGitHubClientConfig) {
    this.session = config.session
    this.sessionStore = config.sessionStore
    this.tokenRefresher = config.tokenRefresher
    this.octokit = new Octokit({ auth: config.session.accessToken })
  }

  private async withTokenRefresh<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (this.isUnauthorizedError(error) && this.session.refreshToken) {
        await this.refreshAndUpdateSession()
        return await fn()
      }
      throw error
    }
  }

  private isUnauthorizedError(error: unknown): boolean {
    if (error && typeof error === "object" && "status" in error) {
      return (error as { status: number }).status === 401
    }
    return false
  }

  private async refreshAndUpdateSession(): Promise<void> {
    if (!this.session.refreshToken) {
      throw new Error("Cannot refresh token: no refresh token available")
    }

    const newTokens = await this.tokenRefresher.refreshOAuthToken({
      accessToken: this.session.accessToken,
      refreshToken: this.session.refreshToken,
    })

    // Update session with new tokens
    const updatedSession: CLISession = {
      ...this.session,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    }

    await this.sessionStore.set(updatedSession)
    this.session = updatedSession
    this.octokit = new Octokit({ auth: newTokens.accessToken })
  }

  async graphql(request: GraphQLQueryRequest): Promise<GraphQlQueryResponse> {
    return this.withTokenRefresh(() =>
      this.octokit.graphql(request.query, request.variables)
    )
  }

  async getRepositoryContent(
    request: GetRepositoryContentRequest
  ): Promise<RepositoryContent> {
    return this.withTokenRefresh(async () => {
      const response = await this.octokit.rest.repos.getContent({
        owner: request.repositoryOwner,
        repo: request.repositoryName,
        path: request.path,
        ref: request.ref,
      })
      const item = response.data as GitHubContentItem
      return { downloadURL: item.download_url }
    })
  }

  async getPullRequestFiles(
    _request: GetPullRequestFilesRequest
  ): Promise<PullRequestFile[]> {
    throw new Error("Not implemented for CLI client")
  }

  async getPullRequestComments(
    _request: GetPullRequestCommentsRequest
  ): Promise<PullRequestComment[]> {
    throw new Error("Not implemented for CLI client")
  }

  async addCommentToPullRequest(
    _request: AddCommentToPullRequestRequest
  ): Promise<void> {
    throw new Error("Not implemented for CLI client")
  }

  async updatePullRequestComment(
    _request: UpdatePullRequestCommentRequest
  ): Promise<void> {
    throw new Error("Not implemented for CLI client")
  }

  async compareCommitsWithBasehead(
    _request: CompareCommitsRequest
  ): Promise<CompareCommitsResponse> {
    throw new Error("Not implemented for CLI client")
  }
}
