import IMutexFactory from "@/common/mutex/IMutexFactory"
import IOAuthTokenRefresher from "./IOAuthTokenRefresher"
import ISessionOAuthTokenRepository from "./ISessionOAuthTokenRepository"
import OAuthToken from "./OAuthToken"
import withMutex from "@/common/mutex/withMutex"

export default class LockingOAuthTokenRefresher implements IOAuthTokenRefresher {
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
  
  async refreshOAuthToken(refreshToken: string): Promise<OAuthToken> {
    const mutex = await this.mutexFactory.makeMutex()
    return await withMutex(mutex, async () => {
      const authToken = await this.tokenRepository.getOAuthToken()
      if (refreshToken != authToken.refreshToken) {
        // Given refresh token is outdated so we use our current access token.
        return authToken
      }
      const refreshResult = await this.tokenRefresher.refreshOAuthToken(authToken.refreshToken)
      await this.tokenRepository.storeOAuthToken(refreshResult)
      return refreshResult
    })
  }
}
