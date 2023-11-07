import { UnauthorizedError } from "@/common"
import OAuthToken from "../domain/oAuthToken/OAuthToken"
import IOAuthTokenRefresher from "../domain/oAuthToken/IOAuthTokenRefresher"

export interface GitHubOAuthTokenRefresherConfig {
  readonly clientId: string
  readonly clientSecret: string
}

export default class GitHubOAuthTokenRefresher implements IOAuthTokenRefresher {
  private readonly config: GitHubOAuthTokenRefresherConfig
  
  constructor(config: GitHubOAuthTokenRefresherConfig) {
    this.config = config
  }
  
  async refreshOAuthToken(oldRefreshToken: string): Promise<OAuthToken> {
    const url = this.getAccessTokenURL(oldRefreshToken)
    const response = await fetch(url, { method: "POST" })
    if (response.status != 200) {
      throw new UnauthorizedError(
        `Failed refreshing access token with HTTP status ${response.status}: ${response.statusText}`
      )
    }
    const data = await response.text()
    const params = new URLSearchParams(data)
    const error = params.get("error")
    const errorDescription = params.get("error_description")
    if (error && error.length > 0) {
      if (errorDescription && errorDescription.length > 0) {
        throw new UnauthorizedError(errorDescription)
      } else {
        throw new UnauthorizedError(error)
      }
    }
    const accessToken = params.get("access_token")
    const refreshToken = params.get("refresh_token")
    if (!accessToken || accessToken.length <= 0 || !refreshToken || refreshToken.length <= 0) {
      throw new UnauthorizedError("Refreshing access token did not produce a valid access token")
    }
    return { accessToken, refreshToken }
  }
  
  private getAccessTokenURL(refreshToken: string): URL {
    const url = new URL("https://github.com/login/oauth/access_token")
    url.searchParams.set("client_id", this.config.clientId)
    url.searchParams.set("client_secret", this.config.clientSecret)
    url.searchParams.set("refresh_token", refreshToken)
    url.searchParams.set("grant_type", "refresh_token")
    return url
  }
}
