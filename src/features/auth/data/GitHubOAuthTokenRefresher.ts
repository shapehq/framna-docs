import OAuthToken from "../domain/OAuthToken"
import IOAuthTokenRefresher from "../domain/IOAuthTokenRefresher"
import { UnauthorizedError } from "../domain/AuthError"

export interface GitHubOAuthTokenRefresherConfig {
  readonly clientId: string
  readonly clientSecret: string
}

export default class GitHubOAuthTokenRefresher implements IOAuthTokenRefresher {
  private readonly config: GitHubOAuthTokenRefresherConfig
  
  constructor(config: GitHubOAuthTokenRefresherConfig) {
    this.config = config
  }
  
  async refreshAccessToken(refreshToken: string): Promise<OAuthToken> {
    console.log("♻️ Will refresh access token...")
    const url = this.getAccessTokenURL(refreshToken)
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
    const newAccessToken = params.get("access_token")
    const newRefreshToken = params.get("refresh_token")
    const newRawAccessTokenExpiryDate = params.get("expires_in")
    const newRawRefreshTokenExpiryDate = params.get("refresh_token_expires_in")
    if (
      !newAccessToken || newAccessToken.length <= 0 ||
      !newRefreshToken || newRefreshToken.length <= 0 ||
      !newRawAccessTokenExpiryDate || newRawAccessTokenExpiryDate.length <= 0 ||
      !newRawRefreshTokenExpiryDate || newRawRefreshTokenExpiryDate.length <= 0
    ) {
      throw new UnauthorizedError("Refreshing access token did not produce a valid access token")
    }
    const accessTokenExpiryDate = new Date(
      new Date().getTime() + parseInt(newRawAccessTokenExpiryDate) * 1000
    )
    const refreshTokenExpiryDate = new Date(
      new Date().getTime() + parseInt(newRawRefreshTokenExpiryDate) * 1000
    )
    console.log("✅ Did refresh access token")
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiryDate: accessTokenExpiryDate,
      refreshTokenExpiryDate: refreshTokenExpiryDate
    }
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
