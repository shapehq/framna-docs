import OAuthToken from "./OAuthToken"

export default interface IOAuthTokenDataSource {
  get(userId: string): Promise<OAuthToken>
}
