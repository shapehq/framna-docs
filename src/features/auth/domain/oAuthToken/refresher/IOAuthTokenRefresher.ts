import { OAuthToken } from ".."

export default interface IOAuthTokenRefresher {
  refreshOAuthToken(oauthToken: OAuthToken): Promise<OAuthToken>
}
