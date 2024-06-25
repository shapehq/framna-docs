import { OAuthToken } from ".."

export default interface IOAuthTokenDataSource {
  getOAuthToken(): Promise<OAuthToken>
}
