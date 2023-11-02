export default interface IAccessTokenRefresher {
  refreshAccessToken(accessToken: string): Promise<string>
}
