import { ISession } from "@/common"
import { OAuthToken } from ".."
import IAccessTokenTransferrer from "./IAccessTokenTransferrer"
import { IMutexFactory } from "@/common"
import withMutex from "../../../../common/mutex/withMutex"

interface IOAuthTokenDataSource {
  get(userId: string): Promise<OAuthToken | null>
}

export default class AccessTokenDataSource {
  private readonly session: ISession
  private readonly oauthTokenDataSource: IOAuthTokenDataSource
  private readonly accessTokenTransferrer: IAccessTokenTransferrer
  private readonly mutexFactory: IMutexFactory
  
  constructor(
    config: {
      session: ISession,
      oauthTokenDataSource: IOAuthTokenDataSource,
      accessTokenTransferrer: IAccessTokenTransferrer,
      mutexFactory: IMutexFactory
    }
  ) {
    this.session = config.session
    this.oauthTokenDataSource = config.oauthTokenDataSource
    this.accessTokenTransferrer = config.accessTokenTransferrer
    this.mutexFactory = config.mutexFactory
  }
  
  async getAccessToken(): Promise<string> {
    // Immediately try to get the OAuth token to avoid a mutex.
    const existingOAuthToken = await this.getExistingOAuthToken()
    if (existingOAuthToken) {
      return existingOAuthToken.accessToken
    }
    const mutex = await this.mutexFactory.makeMutex()
    return await withMutex(mutex, async () => {
      // Make a second attempt to get the OAuth token as it might have been transferred in the mean time.
      const existingOAuthToken = await this.getExistingOAuthToken()
      if (existingOAuthToken) {
        return existingOAuthToken.accessToken
      } else {
        return await this.accessTokenTransferrer.transferAccessToken()
      }
    })
  }
  
  private async getExistingOAuthToken(): Promise<OAuthToken | null> {
    const userId = await this.session.getUserId()
    try {
      return await this.oauthTokenDataSource.get(userId)
    } catch {}
    return null
  }
}
