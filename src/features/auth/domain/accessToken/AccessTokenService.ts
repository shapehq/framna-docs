import IAccessTokenService from "./IAccessTokenService"

export interface IIsGuestReader {
  getIsGuest(): Promise<boolean>
}

interface AccessTokenServiceConfig {
  readonly isGuestReader: IIsGuestReader
  readonly guestAccessTokenService: IAccessTokenService
  readonly hostAccessTokenService: IAccessTokenService
}

export default class AccessTokenService implements IAccessTokenService {
  private readonly isGuestReader: IIsGuestReader
  private readonly guestAccessTokenService: IAccessTokenService
  private readonly hostAccessTokenService: IAccessTokenService
  
  constructor(config: AccessTokenServiceConfig) {
    this.isGuestReader = config.isGuestReader
    this.guestAccessTokenService = config.guestAccessTokenService
    this.hostAccessTokenService = config.hostAccessTokenService
  }
  
  async getAccessToken(): Promise<string> {
    const service = await this.getService()
    return await service.getAccessToken()
  }
  
  async refreshAccessToken(accessToken: string): Promise<string> {
    const service = await this.getService()
    return await service.refreshAccessToken(accessToken)
  }
  
  private async getService() {
    const isGuest = await this.isGuestReader.getIsGuest()
    if (isGuest) {
      return this.guestAccessTokenService
    } else {
      return this.hostAccessTokenService
    }
  }
}