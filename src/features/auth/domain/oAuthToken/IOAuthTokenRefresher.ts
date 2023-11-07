import OAuthToken from "./OAuthToken"

export default interface IOAuthTokenRefresher {
  refreshOAuthToken(refreshToken: string): Promise<OAuthToken>
}
