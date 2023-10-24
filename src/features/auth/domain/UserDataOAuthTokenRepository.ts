import ZodJSONCoder from "@/common/utils/ZodJSONCoder"
import IUserDataRepository from "@/common/userData/IUserDataRepository"
import IUserDataOAuthTokenRepository from ".//UserDataOAuthTokenRepository"
import { UnauthorizedError } from "./AuthError"
import OAuthToken, { OAuthTokenSchema } from "./OAuthToken"

export default class UserDataOAuthTokenRepository implements IUserDataOAuthTokenRepository {
  private readonly repository: IUserDataRepository<string>
  
  constructor(repository: IUserDataRepository<string>) {
    this.repository = repository
  }
  
  async getOAuthToken(userId: string): Promise<OAuthToken> {
    const string = await this.repository.get(userId)
    if (!string) {
      throw new UnauthorizedError(`No OAuthToken stored for user with ID ${userId}.`)
    }
    return ZodJSONCoder.decode(OAuthTokenSchema, string)
  }
  
  async storeOAuthToken(userId: string, token: OAuthToken): Promise<void> {
    const string = ZodJSONCoder.encode(OAuthTokenSchema, token)
    await this.repository.set(userId, string)
  }
  
  async deleteOAuthToken(userId: string): Promise<void> {
    await this.repository.delete(userId)
  }
}
