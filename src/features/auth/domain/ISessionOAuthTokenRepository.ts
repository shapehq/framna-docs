import OAuthToken from "./OAuthToken"

export default interface ISessionOAuthTokenRepository {
  getOAuthToken(): Promise<OAuthToken>
  storeOAuthToken(token: OAuthToken): Promise<void>
  deleteOAuthToken(): Promise<void>
}
