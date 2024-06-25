import SessionValidity from "./SessionValidity"
import { IOAuthTokenDataSource } from ".."

export default class OAuthTokenSessionValidator {
  private readonly oauthTokenDataSource: IOAuthTokenDataSource
  
  constructor(config: { oauthTokenDataSource: IOAuthTokenDataSource }) {
    this.oauthTokenDataSource = config.oauthTokenDataSource
  }
  
  async validateSession(): Promise<SessionValidity> {
    try {
      await this.oauthTokenDataSource.getOAuthToken()
      return SessionValidity.VALID
    } catch (error) {
      return SessionValidity.INVALID_ACCESS_TOKEN
    }
  }
}
