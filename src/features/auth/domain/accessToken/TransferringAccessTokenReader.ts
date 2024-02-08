import { IOAuthTokenRepository, OAuthToken } from ".."

interface IUserIDReader {
  getUserId(): Promise<string>
}

type TransferringAccessTokenReaderConfig = {
  readonly userIdReader: IUserIDReader
  readonly sourceOAuthTokenRepository: IOAuthTokenRepository
  readonly destinationOAuthTokenRepository: IOAuthTokenRepository
}

export default class TransferringAccessTokenReader {
  private readonly userIdReader: IUserIDReader
  private readonly sourceOAuthTokenRepository: IOAuthTokenRepository
  private readonly destinationOAuthTokenRepository: IOAuthTokenRepository
  
  constructor(config: TransferringAccessTokenReaderConfig) {
    this.userIdReader = config.userIdReader
    this.sourceOAuthTokenRepository = config.sourceOAuthTokenRepository
    this.destinationOAuthTokenRepository = config.destinationOAuthTokenRepository
  }
  
  async getAccessToken(): Promise<string> {
    const userId = await this.userIdReader.getUserId()
    let destinationOAuthToken: OAuthToken | undefined
    try {
      destinationOAuthToken = await this.destinationOAuthTokenRepository.get(userId)
    } catch {}
    if (destinationOAuthToken) {
      return destinationOAuthToken.accessToken
    }
    const sourceOAuthToken = await this.sourceOAuthTokenRepository.get(userId)
    await this.destinationOAuthTokenRepository.set(userId, sourceOAuthToken)
    return sourceOAuthToken.accessToken
  }
}
