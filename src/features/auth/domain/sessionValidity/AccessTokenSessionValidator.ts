import SessionValidity from "./SessionValidity"

interface IAccessTokenDataSource {
  getAccessToken(): Promise<string>
}

export default class AccessTokenSessionValidator {
  private readonly accessTokenDataSource: IAccessTokenDataSource
  
  constructor(config: { accessTokenDataSource: IAccessTokenDataSource }) {
    this.accessTokenDataSource = config.accessTokenDataSource
  }
  
  async validateSession(): Promise<SessionValidity> {
    try {
      await this.accessTokenDataSource.getAccessToken()
      return SessionValidity.VALID
    } catch (error) {
      return SessionValidity.INVALID_ACCESS_TOKEN
    }
  }
}
