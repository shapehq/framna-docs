import { UnauthorizedError } from "@/common"
import { IOAuthTokenRepository, OAuthToken } from ".."

export default class CompositeOAuthTokenRepository implements IOAuthTokenRepository {
  private readonly oAuthTokenRepositories: IOAuthTokenRepository[]
  
  constructor(config: { oAuthTokenRepositories: IOAuthTokenRepository[] }) {
    this.oAuthTokenRepositories = config.oAuthTokenRepositories
  }
  
  async set(userId: string, token: OAuthToken): Promise<void> {
    await Promise.all(this.oAuthTokenRepositories.map(async repository => {
      await repository.set(userId, token)
    }))
  }
  
  async delete(userId: string): Promise<void> {
    await Promise.all(this.oAuthTokenRepositories.map(async repository => {
      await repository.delete(userId)
    }))
  }
  
  async get(userId: string): Promise<OAuthToken> {
    for (const repository of this.oAuthTokenRepositories) {
      try  {
        return await repository.get(userId)
      } catch {
        // Ignore error and handle it out of the for loop.
      }
    }
    throw new UnauthorizedError("The access token was not found. It appears that the user is not authenticated.")
  }
}