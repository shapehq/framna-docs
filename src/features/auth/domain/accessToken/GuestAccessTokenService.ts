import { UnauthorizedError } from "../../../../common/errors"
import IAccessTokenService from "./IAccessTokenService"

export interface IUserIDReader {
  getUserId(): Promise<string>
}

export interface Repository {
  get(userId: string): Promise<string | null>
  set(userId: string, token: string): Promise<void>
}

export interface DataSource {
  getAccessToken(userId: string): Promise<string>
}

export type GuestAccessTokenServiceConfig = {
  readonly userIdReader: IUserIDReader
  readonly repository: Repository
  readonly dataSource: DataSource
}

export default class GuestAccessTokenService implements IAccessTokenService {
  private readonly userIdReader: IUserIDReader
  private readonly repository: Repository
  private readonly dataSource: DataSource
  
  constructor(config: GuestAccessTokenServiceConfig) {
    this.userIdReader = config.userIdReader
    this.repository = config.repository
    this.dataSource = config.dataSource
  }
  
  async getAccessToken(): Promise<string> {
    const userId = await this.userIdReader.getUserId()
    const accessToken = await this.repository.get(userId)
    if (!accessToken) {
      throw new UnauthorizedError(`No access token found for user with ID ${userId}`)
    }
    return accessToken
  }
  
  async refreshAccessToken(_accessToken: string): Promise<string> {
    const userId = await this.userIdReader.getUserId()
    const newAccessToken = await this.dataSource.getAccessToken(userId)
    await this.repository.set(userId, newAccessToken)
    return newAccessToken
  }
}