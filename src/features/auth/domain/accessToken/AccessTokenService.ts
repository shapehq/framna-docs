import IAccessTokenService from "./IAccessTokenService"
import IOAuthTokenRepository from "../oAuthToken/IOAuthTokenRepository"
import IOAuthTokenRefresher from "../oAuthToken/IOAuthTokenRefresher"

export interface IUserIDReader {
  getUserId(): Promise<string>
}

type AccessTokenServiceConfig = {
  readonly userIdReader: IUserIDReader
  readonly repository: IOAuthTokenRepository
  readonly refresher: IOAuthTokenRefresher
}

export default class AccessTokenService implements IAccessTokenService {
  private readonly userIdReader: IUserIDReader
  private readonly repository: IOAuthTokenRepository
  private readonly refresher: IOAuthTokenRefresher
  
  constructor(config: AccessTokenServiceConfig) {
    this.userIdReader = config.userIdReader
    this.repository = config.repository
    this.refresher = config.refresher
  }
  
  async getAccessToken(): Promise<string> {
    const userId = await this.userIdReader.getUserId()
    const oAuthToken = await this.repository.get(userId)
    return oAuthToken.accessToken
  }
  
  async refreshAccessToken(_accessToken: string): Promise<string> {
    const userId = await this.userIdReader.getUserId()
    const oAuthToken = await this.repository.get(userId)
    const newOAuthToken = await this.refresher.refreshOAuthToken(oAuthToken.refreshToken)
    await this.repository.set(userId, newOAuthToken)
    return newOAuthToken.accessToken
  }
}
