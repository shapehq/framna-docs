import IMutexFactory from "@/common/mutex/IMutexFactory"
import IAccessTokenService from "./IAccessTokenService"
import IOAuthTokenRefresher from "./IOAuthTokenRefresher"
import ISessionOAuthTokenRepository from "./ISessionOAuthTokenRepository"
import withMutex from "@/common/mutex/withMutex"

export default class AccessTokenService implements IAccessTokenService {
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
  
  async getAccessToken(): Promise<string> {
    return this.ensureExlusiveAccess(async () => {
      const authToken = await this.tokenRepository.getOAuthToken()
      return authToken.accessToken
    })
  }
  
  async refreshAccessToken(): Promise<string> {
    return this.ensureExlusiveAccess(async () => {
      const authToken = await this.tokenRepository.getOAuthToken()
      const refreshResult = await this.tokenRefresher.refreshAccessToken(authToken.refreshToken)
      await this.tokenRepository.storeOAuthToken(refreshResult)
      console.log("💾 Access token saved")
      return refreshResult.accessToken
    })
  }
  
  private async ensureExlusiveAccess<T>(fn: () => Promise<T>): Promise<T> {
    const mutex = await this.mutexFactory.makeMutex()
    return await withMutex(mutex, fn)
  }
}
