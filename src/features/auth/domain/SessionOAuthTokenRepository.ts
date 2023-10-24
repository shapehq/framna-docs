import ISessionDataRepository from "@/common/userData/ISessionDataRepository"
import ISessionOAuthTokenRepository from "../domain/SessionOAuthTokenRepository"
import OAuthToken from "../domain/OAuthToken"
import OAuthTokenCoder from "../domain/OAuthTokenCoder"

export default class SessionOAuthTokenRepository implements ISessionOAuthTokenRepository {
  private readonly repository: ISessionDataRepository<string>
  
  constructor(repository: ISessionDataRepository<string>) {
    this.repository = repository
  }
  
  async getOAuthToken(): Promise<OAuthToken> {
    const string = await this.repository.get()
    if (!string) {
      throw new Error(`No OAuthToken stored for user.`)
    }
    return OAuthTokenCoder.decode(string)
  }
  
  async storeOAuthToken(token: OAuthToken): Promise<void> {
    const string = OAuthTokenCoder.encode(token)
    await this.repository.set(string)
  }
  
  async deleteOAuthToken(): Promise<void> {
    await this.repository.delete()
  }
}
