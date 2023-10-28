export default interface IAccessTokenService {
  async getAccessToken(): Promise<string>
}
