import SessionValidity from "./SessionValidity"

interface IAccessTokenService {
  getAccessToken(): Promise<string>
}

type AccessTokenSessionValidatorConfig = {
  readonly accessTokenService: IAccessTokenService
}

export default class AccessTokenSessionValidator {
  private readonly accessTokenService: IAccessTokenService
  
  constructor(config: AccessTokenSessionValidatorConfig) {
    this.accessTokenService = config.accessTokenService
  }
  
  async validateSession(): Promise<SessionValidity> {
    try {
      await this.accessTokenService.getAccessToken()
      return SessionValidity.VALID
    } catch {
      return SessionValidity.INVALID_ACCESS_TOKEN
    }
  }
}
