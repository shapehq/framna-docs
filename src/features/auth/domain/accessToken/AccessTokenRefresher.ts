import IAccessTokenRefresher from "./IAccessTokenRefresher"
import IOAuthTokenRepository from "../oAuthToken/IOAuthTokenRepository"
import IOAuthTokenRefresher from "../oAuthToken/IOAuthTokenRefresher"
import OAuthToken from "../oAuthToken/OAuthToken"
import { UnauthorizedError } from "@/common"

interface IUserIDReader {
  getUserId(): Promise<string>
}

type HostAccessTokenServiceConfig = {
  readonly userIdReader: IUserIDReader
  readonly oAuthTokenRepository: IOAuthTokenRepository
  readonly oAuthTokenRefresher: IOAuthTokenRefresher
}

export default class AccessTokenRefresher implements IAccessTokenRefresher {
  private readonly userIdReader: IUserIDReader
  private readonly oAuthTokenRepository: IOAuthTokenRepository
  private readonly oAuthTokenRefresher: IOAuthTokenRefresher
  
  constructor(config: HostAccessTokenServiceConfig) {
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
    console.log("♻️ Refresh: " + oAuthToken.refreshToken)
    let newOAuthToken: OAuthToken | undefined
    try {
      newOAuthToken = await this.oAuthTokenRefresher.refreshOAuthToken(oAuthToken.refreshToken)
    } catch (error) {
      // console.error(error)
      // await this.oAuthTokenRepository.delete(userId)
      throw new UnauthorizedError("Refresh token is invalid.")
    }
    console.log("💾 Store new token")
    console.log(newOAuthToken)
    await this.oAuthTokenRepository.set(userId, newOAuthToken)
    return newOAuthToken.accessToken
  }
}