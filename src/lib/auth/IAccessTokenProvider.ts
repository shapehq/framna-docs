export interface IAccessTokenProvider {
  getAccessToken(): Promise<string>
}
