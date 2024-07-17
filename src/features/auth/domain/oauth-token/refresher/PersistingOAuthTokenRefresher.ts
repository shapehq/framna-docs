import { OAuthToken, IOAuthTokenRepository } from ".."
import IOAuthTokenRefresher from "./IOAuthTokenRefresher"

interface IUserIDReader {
  getUserId(): Promise<string>
}

export default class PersistingOAuthTokenRefresher implements IOAuthTokenRefresher {
  private readonly userIdReader: IUserIDReader
  private readonly oauthTokenRepository: IOAuthTokenRepository
  private readonly oauthTokenRefresher: IOAuthTokenRefresher
  
  constructor(config: {
    userIdReader: IUserIDReader
    oauthTokenRepository: IOAuthTokenRepository
    oauthTokenRefresher: IOAuthTokenRefresher
  }) {
    this.userIdReader = config.userIdReader
    this.oauthTokenRepository = config.oauthTokenRepository
    this.oauthTokenRefresher = config.oauthTokenRefresher
  }
  
  async refreshOAuthToken(oldOAuthToken: OAuthToken): Promise<OAuthToken> {
    const userId = await this.userIdReader.getUserId()
    const currentOAuthToken = await this.oauthTokenRepository.get(userId)
    if (
      oldOAuthToken.accessToken != currentOAuthToken.accessToken ||
      oldOAuthToken.refreshToken != currentOAuthToken.refreshToken
    ) {
      // Given OAuth token is outdated so we use our current OAuth token.
      return {
        accessToken: currentOAuthToken.accessToken,
        refreshToken: currentOAuthToken.refreshToken
      }
    }
    // Given OAuth token is stale so we refresh it.
    const newOAuthToken = await this.oauthTokenRefresher.refreshOAuthToken(oldOAuthToken)
    await this.oauthTokenRepository.set(userId, newOAuthToken)
    return newOAuthToken
  }
}
