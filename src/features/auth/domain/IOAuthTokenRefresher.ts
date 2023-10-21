export interface IOAuthTokenRefreshResult {
  readonly accessToken: string
  readonly refreshToken: string
  readonly accessTokenExpiryDate: Date
  readonly refreshTokenExpiryDate: Date
}

export default interface IOAuthTokenRefresher {
  refreshAccessToken(refreshToken: string): Promise<IOAuthTokenRefreshResult>
}
