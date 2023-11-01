export default interface IAccessTokenService {
  getAccessToken(): Promise<string>
  refreshAccessToken(): Promise<string>
}
