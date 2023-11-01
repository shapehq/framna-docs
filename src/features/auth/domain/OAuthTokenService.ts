import IMutexFactory from "@/common/mutex/IMutexFactory"
import IOAuthTokenService from "./IOAuthTokenService"
import IOAuthTokenRefresher from "./IOAuthTokenRefresher"
import ISessionOAuthTokenRepository from "./ISessionOAuthTokenRepository"
import OAuthToken from "./OAuthToken"
import withMutex from "@/common/mutex/withMutex"

export default class OAuthTokenService implements IOAuthTokenService {
  private readonly mutexFactory: IMutexFactory
  private readonly tokenRepository: ISessionOAuthTokenRepository
  private readonly tokenRefresher: IOAuthTokenRefresher
  
  constructor(
    mutexFactory: IMutexFactory,
    tokenRepository: ISessionOAuthTokenRepository,
    tokenRefresher: IOAuthTokenRefresher
  ) {
    this.mutexFactory = mutexFactory
    this.tokenRepository = tokenRepository
    this.tokenRefresher = tokenRefresher
  }
  
  async getOAuthToken(): Promise<OAuthToken> {
    return await this.tokenRepository.getOAuthToken()
  }
  
  async refreshOAuthToken(refreshToken: string): Promise<OAuthToken> {
    return this.ensureExlusiveAccess(async () => {
      const authToken = await this.tokenRepository.getOAuthToken()
      if (refreshToken != authToken.refreshToken) {
        // Given refresh token is outdated so we use our current access token.
        return authToken
      }
      const refreshResult = await this.tokenRefresher.refreshAccessToken(authToken.refreshToken)
      await this.tokenRepository.storeOAuthToken(refreshResult)
      console.log("💾 Access token saved")
      return refreshResult
    })
  }
  
  private async ensureExlusiveAccess<T>(fn: () => Promise<T>): Promise<T> {
    const mutex = await this.mutexFactory.makeMutex()
    return await withMutex(mutex, fn)
  }
}
