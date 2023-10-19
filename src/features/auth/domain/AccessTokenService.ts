import IOAuthTokenRepository from "../domain/IOAuthTokenRepository"
import IOAuthTokenRefresher from "../domain/IOAuthTokenRefresher"

export default class AccessTokenService {
  private readonly tokenRepository: IOAuthTokenRepository
  private readonly tokenRefresher: IOAuthTokenRefresher
  private readonly tokenExpirationThreshold = 5 * 60 * 1000
  
  constructor(
    tokenRepository: IOAuthTokenRepository,
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
      return await this.refreshAccessToken(authToken.refreshToken)
    } else {
      throw new Error("Tokens have expired")
    }
  }
  
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const refreshResult = await this.tokenRefresher.refreshAccessToken(refreshToken)
    await this.tokenRepository.storeOAuthToken(refreshResult)
    return refreshResult.accessToken
  }
}
