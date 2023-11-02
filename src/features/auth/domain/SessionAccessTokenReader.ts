import ISessionOAuthTokenRepository from "./ISessionOAuthTokenRepository"

export default class AccessTokenReader {
  private readonly oAuthTokenRepository: ISessionOAuthTokenRepository
  
  constructor(oAuthTokenRepository: ISessionOAuthTokenRepository) {
    this.oAuthTokenRepository = oAuthTokenRepository
  }
  
  async getAccessToken(): Promise<string> {
    const authToken = await this.oAuthTokenRepository.getOAuthToken()
    return authToken.accessToken
  }
}
