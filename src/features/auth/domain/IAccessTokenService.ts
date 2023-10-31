export default interface IAccessTokenService {
  getAccessToken(): Promise<string>
}
