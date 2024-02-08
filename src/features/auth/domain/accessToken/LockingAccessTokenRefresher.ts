import { IMutexFactory } from "@/common"
import withMutex from "../../../../common/mutex/withMutex"
import IAccessTokenRefresher from "./IAccessTokenRefresher"

export default class LockingAccessTokenRefresher implements IAccessTokenRefresher {
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
