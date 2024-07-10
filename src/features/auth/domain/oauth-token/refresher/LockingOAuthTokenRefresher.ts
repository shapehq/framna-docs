import { IMutexFactory, withMutex } from "@/common"
import { IOAuthTokenRefresher, OAuthToken } from ".."

export default class LockingOAuthTokenRefresher implements IOAuthTokenRefresher {
  private readonly mutexFactory: IMutexFactory
  private readonly oauthTokenRefresher: IOAuthTokenRefresher
  
  constructor(config: {
    mutexFactory: IMutexFactory
    oauthTokenRefresher: IOAuthTokenRefresher
  }) {
    this.mutexFactory = config.mutexFactory
    this.oauthTokenRefresher = config.oauthTokenRefresher
  }
  
  async refreshOAuthToken(oauthToken: OAuthToken): Promise<OAuthToken> {
    const mutex = await this.mutexFactory.makeMutex()
    return await withMutex(mutex, async () => {
      return await this.oauthTokenRefresher.refreshOAuthToken(oauthToken)
    })
  }
}
