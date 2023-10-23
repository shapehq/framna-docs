import OAuthToken from "./OAuthToken"

export default interface IOAuthTokenRefresher {
  refreshAccessToken(refreshToken: string): Promise<OAuthToken>
}
