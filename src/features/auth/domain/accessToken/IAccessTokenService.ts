export default interface IAccessTokenService {
  getAccessToken(): Promise<string>
  refreshAccessToken(accessToken: string): Promise<string>
}
