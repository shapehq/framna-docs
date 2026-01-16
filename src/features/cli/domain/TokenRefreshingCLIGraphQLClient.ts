import { Octokit } from "octokit"
import IGitHubGraphQLClient, {
  GitHubGraphQLClientRequest,
  GitHubGraphQLClientResponse,
} from "@/features/projects/domain/IGitHubGraphQLClient"
import { IOAuthTokenRefresher } from "@/features/auth/domain"
import { ICLISessionStore } from "./ICLISessionStore"
import { CLISession } from "./CLISession"

interface TokenRefreshingCLIGraphQLClientConfig {
  session: CLISession
  sessionStore: ICLISessionStore
  tokenRefresher: IOAuthTokenRefresher
}

/**
 * GraphQL client for CLI that automatically refreshes expired tokens.
 * When a 401 error is received, it refreshes the token, updates the session,
 * and retries the request.
 */
export class TokenRefreshingCLIGraphQLClient implements IGitHubGraphQLClient {
  private octokit: Octokit
  private session: CLISession
  private readonly sessionStore: ICLISessionStore
  private readonly tokenRefresher: IOAuthTokenRefresher

  constructor(config: TokenRefreshingCLIGraphQLClientConfig) {
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

  async graphql(
    request: GitHubGraphQLClientRequest
  ): Promise<GitHubGraphQLClientResponse> {
    return this.withTokenRefresh(() =>
      this.octokit.graphql(request.query, request.variables)
    )
  }
}
