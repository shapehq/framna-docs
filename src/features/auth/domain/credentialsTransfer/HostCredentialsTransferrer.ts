import IOAuthTokenRefresher from "../oAuthToken/IOAuthTokenRefresher"
import IOAuthTokenRepository from "../oAuthToken/IOAuthTokenRepository"
import ICredentialsTransferrer from "./ICredentialsTransferrer"

export interface IRefreshTokenReader {
  getRefreshToken(userId: string): Promise<string>
}

type HostCredentialsTransferrerConfig = {
  readonly refreshTokenReader: IRefreshTokenReader
  readonly oAuthTokenRefresher: IOAuthTokenRefresher
  readonly oAuthTokenRepository: IOAuthTokenRepository
}

export default class HostCredentialsTransferrer implements ICredentialsTransferrer {
  private readonly refreshTokenReader: IRefreshTokenReader
  private readonly oAuthTokenRefresher: IOAuthTokenRefresher
  private readonly oAuthTokenRepository: IOAuthTokenRepository
  
  constructor(config: HostCredentialsTransferrerConfig) {
    this.refreshTokenReader = config.refreshTokenReader
    this.oAuthTokenRefresher = config.oAuthTokenRefresher
    this.oAuthTokenRepository = config.oAuthTokenRepository
  }
  
  async transferCredentials(userId: string): Promise<void> {
    const refreshToken = await this.refreshTokenReader.getRefreshToken(userId)
    const authToken = await this.oAuthTokenRefresher.refreshOAuthToken(refreshToken)
    await this.oAuthTokenRepository.set(userId, authToken)
  }
}
