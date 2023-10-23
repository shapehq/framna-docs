import OAuthToken from "./OAuthToken"

export default interface IOAuthTokenRepository {
  getOAuthToken(userId: string): Promise<OAuthToken>
  storeOAuthToken(token: OAuthToken, userId: string): Promise<void>
  deleteOAuthToken(userId: string): Promise<void>
}
