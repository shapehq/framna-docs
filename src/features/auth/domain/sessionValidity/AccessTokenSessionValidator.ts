import SessionValidity from "./SessionValidity"

interface IAccessTokenReader {
  getAccessToken(): Promise<string>
}

type AccessTokenSessionValidatorConfig = {
  readonly accessTokenReader: IAccessTokenReader
}

export default class AccessTokenSessionValidator {
  private readonly accessTokenReader: IAccessTokenReader
  
  constructor(config: AccessTokenSessionValidatorConfig) {
    this.accessTokenReader = config.accessTokenReader
  }
  
  async validateSession(): Promise<SessionValidity> {
    try {
      await this.accessTokenReader.getAccessToken()
      return SessionValidity.VALID
    } catch (error) {
      console.error(error)
      return SessionValidity.INVALID_ACCESS_TOKEN
    }
  }
}
