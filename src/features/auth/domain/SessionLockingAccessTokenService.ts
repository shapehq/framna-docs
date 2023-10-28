import ISession from "@/common/session/ISession"
import IMutexFactory from "@/common/mutex/IMutexFactory"
import IAccessTokenService from "./IAccessTokenService"

export default class SessionLockingAccessTokenService implements IAccessTokenService {
  private readonly session: ISession
  private readonly mutexFactory: IMutexFactory
  private readonly accessTokenService: IAccessTokenService
  
  constructor(
    session: ISession,
    mutexFactory: IMutexFactory,
    accessTokenService: IAccessTokenService
  ) {
    this.session = session
    this.mutexFactory = mutexFactory
    this.accessTokenService = accessTokenService
  }
  
  async getAccessToken(): Promise<string> {
    const userId = await this.session.getUserId()
    const mutexKey = `mutexAccessToken[${userId}]`
    return await this.mutexFactory.withMutex(mutexKey, async () => {
      return await this.accessTokenService.getAccessToken()
    })
  }
}
