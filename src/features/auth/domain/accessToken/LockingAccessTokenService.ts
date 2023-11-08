import { IMutexFactory } from "@/common"
import IAccessTokenService from "./IAccessTokenService"
import withMutex from "../../../../common/mutex/withMutex"

export default class LockingAccessTokenService implements IAccessTokenService {
  private readonly mutexFactory: IMutexFactory
  private readonly accessTokenService: IAccessTokenService
  
  constructor(
    mutexFactory: IMutexFactory,
    accessTokenService: IAccessTokenService
  ) {
    this.mutexFactory = mutexFactory
    this.accessTokenService = accessTokenService
  }
  
  async getAccessToken(): Promise<string> {
    return await this.accessTokenService.getAccessToken()
  }
  
  async refreshAccessToken(accessToken: string): Promise<string> {
    const mutex = await this.mutexFactory.makeMutex()
    return await withMutex(mutex, async () => {
      return await this.accessTokenService.refreshAccessToken(accessToken)
    })
  }
}
