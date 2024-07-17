import { IOAuthTokenRepository, OAuthToken } from ".."

export default class FallbackOAuthTokenRepository implements IOAuthTokenRepository {
  private readonly primaryRepository: IOAuthTokenRepository
  private readonly secondaryRepository: IOAuthTokenRepository
  
  constructor(config: {
    primaryRepository: IOAuthTokenRepository,
    secondaryRepository: IOAuthTokenRepository
  }) {
    this.primaryRepository = config.primaryRepository
    this.secondaryRepository = config.secondaryRepository
  }
  
  async get(userId: string): Promise<OAuthToken> {
    try {
      return await this.primaryRepository.get(userId)
    } catch {
      // Reading from the primary repository failed so we'll try the secondary repository.
      // However, we don't know if the error is due to the OAuth token not existing in
      // the primary repository or some other error occurred.
      // We might consider changing get(_:) on IOAuthTokenRepository to return null in the
      // case a token doesn't exist rather than throwing an error.
      const oauthToken = await this.secondaryRepository.get(userId)
      await this.primaryRepository.set(userId, oauthToken)
      return oauthToken
    }
  }
  
  async set(userId: string, token: OAuthToken): Promise<void> {
    await this.primaryRepository.set(userId, token)
  }
  
  async delete(userId: string): Promise<void> {
    await this.primaryRepository.delete(userId)
  }
}
