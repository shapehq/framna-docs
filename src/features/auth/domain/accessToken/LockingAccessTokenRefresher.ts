import { IMutexFactory } from "@/common"
import withMutex from "../../../../common/mutex/withMutex"

interface IAccessTokenRefresher {
  refreshAccessToken(accessToken: string): Promise<string>
}

export default class LockingAccessTokenRefresher {
  private readonly mutexFactory: IMutexFactory
  private readonly accessTokenRefresher: IAccessTokenRefresher
  
  constructor(
    config: {
      mutexFactory: IMutexFactory
      accessTokenRefresher: IAccessTokenRefresher
    }
  ) {
    this.mutexFactory = config.mutexFactory
    this.accessTokenRefresher = config.accessTokenRefresher
  }
  
  async refreshAccessToken(accessToken: string): Promise<string> {
    const mutex = await this.mutexFactory.makeMutex()
    return await withMutex(mutex, async () => {
      return await this.accessTokenRefresher.refreshAccessToken(accessToken)
    })
  }
}
