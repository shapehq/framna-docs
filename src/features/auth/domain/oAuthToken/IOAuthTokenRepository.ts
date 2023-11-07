import OAuthToken from "./OAuthToken"

export default interface IOAuthTokenRepository {
  get(userId: string): Promise<OAuthToken>
  set(userId: string, token: OAuthToken): Promise<void>
  delete(userId: string): Promise<void>
}
