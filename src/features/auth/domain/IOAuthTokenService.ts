import OAuthToken from "./OAuthToken"

export default interface IOAuthTokenService {
  getOAuthToken(): Promise<OAuthToken>
  refreshOAuthToken(refreshToken: string): Promise<OAuthToken>
}
