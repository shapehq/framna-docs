import { ISession } from "@/common"
import { IOAuthTokenRepository, IOAuthTokenDataSource } from ".."

export default class GitHubAccessTokenTransferrer {
  private readonly session: ISession
  private readonly sourceOAuthTokenDataSource: IOAuthTokenDataSource
  private readonly destinationOAuthTokenRepository: IOAuthTokenRepository
  
  constructor(
    config: {
      session: ISession,
      sourceOAuthTokenDataSource: IOAuthTokenDataSource,
      destinationOAuthTokenRepository: IOAuthTokenRepository
    }
  ) {
    this.session = config.session
    this.sourceOAuthTokenDataSource = config.sourceOAuthTokenDataSource
    this.destinationOAuthTokenRepository = config.destinationOAuthTokenRepository
  }
  
  async transferAccessToken(): Promise<string> {
    const userId = await this.session.getUserId()
    const oAuthToken = await this.sourceOAuthTokenDataSource.get(userId)
    await this.destinationOAuthTokenRepository.set(userId, oAuthToken)
    return oAuthToken.accessToken
  }
}
