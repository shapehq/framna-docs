import IMutexFactory from "@/common/mutex/IMutexFactory"
import IAccessTokenRefresher from "./IAccessTokenRefresher"
import IOAuthTokenRefresher from "./IOAuthTokenRefresher"
import ISessionOAuthTokenRepository from "./ISessionOAuthTokenRepository"
import withMutex from "../../../common/mutex/withMutex"

export default class LockingAccessTokenRefresher implements IAccessTokenRefresher {
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
  
  async refreshAccessToken(accessToken: string): Promise<string> {
    const mutex = await this.mutexFactory.makeMutex()
    return await withMutex(mutex, async () => {
      const authToken = await this.tokenRepository.getOAuthToken()
      if (accessToken != authToken.accessToken) {
        // Given refresh token is outdated so we use our current access token.
        return authToken.accessToken
      }
      const refreshResult = await this.tokenRefresher.refreshOAuthToken(authToken.refreshToken)
      await this.tokenRepository.storeOAuthToken(refreshResult)
      return refreshResult.accessToken
    })
  }
}
