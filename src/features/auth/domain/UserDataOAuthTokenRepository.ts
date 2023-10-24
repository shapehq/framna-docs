import IUserDataRepository from "@/common/userData/IUserDataRepository"
import IUserDataOAuthTokenRepository from "../domain/UserDataOAuthTokenRepository"
import OAuthToken from "../domain/OAuthToken"
import OAuthTokenCoder from "../domain/OAuthTokenCoder"

export default class UserDataOAuthTokenRepository implements IUserDataOAuthTokenRepository {
  private readonly repository: IUserDataRepository<string>
  
  constructor(repository: IUserDataRepository<string>) {
    this.repository = repository
  }
  
  async getOAuthToken(userId: string): Promise<OAuthToken> {
    const string = await this.repository.get(userId)
    if (!string) {
      throw new Error(`No OAuthToken stored for user with ID ${userId}.`)
    }
    return OAuthTokenCoder.decode(string)
  }
  
  async storeOAuthToken(userId: string, token: OAuthToken): Promise<void> {
    const string = OAuthTokenCoder.encode(token)
    await this.repository.set(userId, string)
  }
  
  async deleteOAuthToken(userId: string): Promise<void> {
    await this.repository.delete(userId)
  }
}
