import IAccessTokenRefresher from "./IAccessTokenRefresher"
import IOAuthTokenRepository from "../oAuthToken/IOAuthTokenRepository"
import IOAuthTokenRefresher from "../oAuthToken/IOAuthTokenRefresher"

interface IUserIDReader {
  getUserId(): Promise<string>
}

export default class AccessTokenRefresher implements IAccessTokenRefresher {
  private readonly userIdReader: IUserIDReader
  private readonly oAuthTokenRepository: IOAuthTokenRepository
  private readonly oAuthTokenRefresher: IOAuthTokenRefresher
  
  constructor(
    config: {
      userIdReader: IUserIDReader
      oAuthTokenRepository: IOAuthTokenRepository
      oAuthTokenRefresher: IOAuthTokenRefresher
    }
  ) {
    this.userIdReader = config.userIdReader
    this.oAuthTokenRepository = config.oAuthTokenRepository
    this.oAuthTokenRefresher = config.oAuthTokenRefresher
  }
  
  async refreshAccessToken(accessToken: string): Promise<string> {
    const userId = await this.userIdReader.getUserId()
    const oAuthToken = await this.oAuthTokenRepository.get(userId)
    if (accessToken != oAuthToken.accessToken) {
      // Given access token is outdated so we use our stored access token.
      return oAuthToken.accessToken
    }
    // Given access token is stale so we refresh it.
    const newOAuthToken = await this.oAuthTokenRefresher.refreshOAuthToken(oAuthToken.refreshToken)
    await this.oAuthTokenRepository.set(userId, newOAuthToken)
    return newOAuthToken.accessToken
  }
}