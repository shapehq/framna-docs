import ISessionOAuthTokenRepository from "./ISessionOAuthTokenRepository"
import IOAuthTokenRefresher from "./IOAuthTokenRefresher"
import { UnauthorizedError } from "./AuthError"

export default class AccessTokenService {
  private readonly tokenRepository: ISessionOAuthTokenRepository
  private readonly tokenRefresher: IOAuthTokenRefresher
  private readonly tokenExpirationThreshold = 5 * 60 * 1000
  
  constructor(
    tokenRepository: ISessionOAuthTokenRepository,
    tokenRefresher: IOAuthTokenRefresher
  ) {
    this.tokenRepository = tokenRepository
    this.tokenRefresher = tokenRefresher
  }
  
  async getAccessToken(): Promise<string> {
    const authToken = await this.tokenRepository.getOAuthToken()
    const accessTokenExpiryDate = new Date(
      authToken.accessTokenExpiryDate.getTime() - this.tokenExpirationThreshold
    )
    const refreshTokenExpiryDate = new Date(
      authToken.refreshTokenExpiryDate.getTime() - this.tokenExpirationThreshold
    )
    const now = new Date()
    if (accessTokenExpiryDate.getTime() > now.getTime()) {
      return authToken.accessToken
    } else if (refreshTokenExpiryDate.getTime() > now.getTime()) {
      return await this.refreshSpecifiedAccessToken(authToken.refreshToken)
    } else {
      throw new UnauthorizedError("Both the access token and refresh token have expired.")
    }
  }
  
  private async refreshSpecifiedAccessToken(refreshToken: string): Promise<string> {
    const refreshResult = await this.tokenRefresher.refreshAccessToken(refreshToken)
    await this.tokenRepository.storeOAuthToken(refreshResult)
    return refreshResult.accessToken
  }
}
