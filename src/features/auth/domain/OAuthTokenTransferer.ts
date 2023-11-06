import IRefreshTokenReader from "./IRefreshTokenReader"
import IOAuthTokenRefresher from "./IOAuthTokenRefresher"
import IOAuthTokenRepository from "./IOAuthTokenRepository"

type OAuthTokenTransfererConfig = {
  readonly refreshTokenReader: IRefreshTokenReader
  readonly oAuthTokenRefresher: IOAuthTokenRefresher
  readonly oAuthTokenRepository: IOAuthTokenRepository
}

export default class OAuthTokenTransferer {
  private readonly config: OAuthTokenTransfererConfig
  
  constructor(config: OAuthTokenTransfererConfig) {
    this.config = config
  }
  
  async transferAuthTokenForUser(userId: string): Promise<void> {
    const refreshToken = await this.config.refreshTokenReader.getRefreshToken(userId)
    const authToken = await this.config.oAuthTokenRefresher.refreshOAuthToken(refreshToken)
    this.config.oAuthTokenRepository.storeOAuthToken(userId, authToken)
  }
}
