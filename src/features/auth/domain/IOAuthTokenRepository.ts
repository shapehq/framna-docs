export interface IOAuthToken {
  readonly accessToken: string
  readonly refreshToken: string
  readonly accessTokenExpiryDate: Date
  readonly refreshTokenExpiryDate: Date
}

export default interface IOAuthTokenRepository {
  getOAuthToken(): Promise<IOAuthToken>
  storeOAuthToken(token: IOAuthToken): Promise<void>
}
