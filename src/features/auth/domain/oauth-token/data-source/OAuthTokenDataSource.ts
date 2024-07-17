import { ISession } from "@/common"
import { OAuthToken, IOAuthTokenRepository } from ".."
import IOAuthTokenDataSource from "./IOAuthTokenDataSource"

export default class PersistingOAuthTokenDataSource implements IOAuthTokenDataSource {
  private readonly session: ISession
  private readonly repository: IOAuthTokenRepository
  
  constructor(config: { session: ISession, repository: IOAuthTokenRepository }) {
    this.session = config.session
    this.repository = config.repository
  }
  
  async getOAuthToken(): Promise<OAuthToken> {
    const userId = await this.session.getUserId()
    return await this.repository.get(userId)
  }
}
