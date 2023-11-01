import IRefreshTokenReader from "./IRefreshTokenReader"
import IOAuthTokenRefresher from "./IOAuthTokenRefresher"
import IUserDataOAuthTokenRepository from "./IUserDataOAuthTokenRepository"

type InitialOAuthTokenServiceConfig = {
  readonly refreshTokenReader: IRefreshTokenReader
  readonly oAuthTokenRefresher: IOAuthTokenRefresher
  readonly oAuthTokenRepository: IUserDataOAuthTokenRepository
}

export default class InitialOAuthTokenService {
  private readonly config: InitialOAuthTokenServiceConfig
  
  constructor(config: InitialOAuthTokenServiceConfig) {
    this.config = config
  }
  
  async fetchInitialAuthTokenForUser(userId: string): Promise<void> {
    const refreshToken = await this.config.refreshTokenReader.getRefreshToken(userId)
    const authToken = await this.config.oAuthTokenRefresher.refreshOAuthToken(refreshToken)
    this.config.oAuthTokenRepository.storeOAuthToken(userId, authToken)
  }
}
