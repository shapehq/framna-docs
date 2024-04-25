import { IOAuthTokenRepository, OAuthToken } from ".."

interface IUserIDReader {
  getUserId(): Promise<string>
}

export default class AccessTokenReader {
  private readonly userIdReader: IUserIDReader
  private readonly sourceOAuthTokenRepository: IOAuthTokenRepository
  private readonly destinationOAuthTokenRepository: IOAuthTokenRepository
  
  constructor(
    config: {
      userIdReader: IUserIDReader
      sourceOAuthTokenRepository: IOAuthTokenRepository
      destinationOAuthTokenRepository: IOAuthTokenRepository
    }
  ) {
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
