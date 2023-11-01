export interface IOAuthToken {
  readonly accessToken: string
  readonly refreshToken: string
}

export default interface IOAuthTokenRepository {
  getOAuthToken(): Promise<IOAuthToken>
  storeOAuthToken(token: IOAuthToken): Promise<void>
}
