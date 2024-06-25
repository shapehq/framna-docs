import { OAuthToken, IOAuthTokenDataSource } from ".."
import IOAuthTokenRefresher from "./IOAuthTokenRefresher"

export default class GuestOAuthTokenRefresher implements IOAuthTokenRefresher {
  private readonly dataSource: IOAuthTokenDataSource
  
  constructor(config: { dataSource: IOAuthTokenDataSource }) {
    this.dataSource = config.dataSource
  }
  
  async refreshOAuthToken(oldOAuthToken: OAuthToken): Promise<OAuthToken> {
    if (oldOAuthToken.refreshToken) {
      throw new Error("The refresher should not be used when a refresh token is available")
    }
    return await this.dataSource.getOAuthToken()
  }
}
