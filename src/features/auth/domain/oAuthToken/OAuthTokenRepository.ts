import { IUserDataRepository, UnauthorizedError, ZodJSONCoder } from "../../../../common"
import IOAuthTokenRepository from "./IOAuthTokenRepository"
import OAuthToken, { OAuthTokenSchema } from "./OAuthToken"

export default class OAuthTokenRepository implements IOAuthTokenRepository {
  private readonly repository: IUserDataRepository<string>
  
  constructor(repository: IUserDataRepository<string>) {
    this.repository = repository
  }
  
  async get(userId: string): Promise<OAuthToken> {
    const string = await this.repository.get(userId)
    if (!string) {
      throw new UnauthorizedError(`No OAuthToken stored for user with ID ${userId}.`)
    }
    return ZodJSONCoder.decode(OAuthTokenSchema, string)
  }
  
  async set(userId: string, token: OAuthToken): Promise<void> {
    const string = ZodJSONCoder.encode(OAuthTokenSchema, token)
    await this.repository.set(userId, string)
  }
  
  async delete(userId: string): Promise<void> {
    await this.repository.delete(userId)
  }
}
