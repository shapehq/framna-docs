import { ISession, IMutexFactory, withMutex } from "@/common"
import { OAuthToken, IOAuthTokenRepository } from ".."
import IOAuthTokenDataSource from "./IOAuthTokenDataSource"

export default class PersistingOAuthTokenDataSource implements IOAuthTokenDataSource {
  private readonly session: ISession
  private readonly mutexFactory: IMutexFactory
  private readonly repository: IOAuthTokenRepository
  private readonly dataSource: IOAuthTokenDataSource
  
  constructor(config: {
    session: ISession,
    mutexFactory: IMutexFactory,
    repository: IOAuthTokenRepository,
    dataSource: IOAuthTokenDataSource
  }) {
    this.session = config.session
    this.mutexFactory = config.mutexFactory
    this.repository = config.repository
    this.dataSource = config.dataSource
  }
  
  async getOAuthToken(): Promise<OAuthToken> {
    // Immediately try to get the OAuth token to avoid a mutex.
    const existingOAuthToken = await this.getExistingOAuthToken()
    if (existingOAuthToken) {
      return existingOAuthToken
    }
    const mutex = await this.mutexFactory.makeMutex()
    return await withMutex(mutex, async () => {
      // Make a second attempt to get the OAuth token as it might have been created in the mean time.
      const existingOAuthToken = await this.getExistingOAuthToken()
      if (existingOAuthToken) {
        return existingOAuthToken
      } else {
        return await this.getNewOAuthToken()
      }
    })
  }
  
  private async getExistingOAuthToken(): Promise<OAuthToken | null> {
    const userId = await this.session.getUserId()
    try {
      return await this.repository.get(userId)
    } catch {}
    return null
  }
  
  private async getNewOAuthToken(): Promise<OAuthToken> {
    const userId = await this.session.getUserId()
    const oauthToken = await this.dataSource.getOAuthToken()
    await this.repository.set(userId, oauthToken)
    return oauthToken
  }
}
