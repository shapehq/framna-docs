import ZodJSONCoder from "../../../common/utils/ZodJSONCoder"
import ISessionDataRepository from "@/common/userData/ISessionDataRepository"
import ISessionOAuthTokenRepository from "./SessionOAuthTokenRepository"
import { UnauthorizedError } from "./AuthError"
import OAuthToken, { OAuthTokenSchema } from "./OAuthToken"

export default class SessionOAuthTokenRepository implements ISessionOAuthTokenRepository {
  private readonly repository: ISessionDataRepository<string>
  
  constructor(repository: ISessionDataRepository<string>) {
    this.repository = repository
  }
  
  async getOAuthToken(): Promise<OAuthToken> {
    const string = await this.repository.get()
    if (!string) {
      throw new UnauthorizedError(`No OAuthToken stored for user.`)
    }
    return ZodJSONCoder.decode(OAuthTokenSchema, string)
  }
  
  async storeOAuthToken(token: OAuthToken): Promise<void> {
    const string = ZodJSONCoder.encode(OAuthTokenSchema, token)
    await this.repository.set(string)
  }
  
  async deleteOAuthToken(): Promise<void> {
    await this.repository.delete()
  }
}
