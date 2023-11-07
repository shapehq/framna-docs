import IAccessTokenService from "./IAccessTokenService"

export default class OnlyStaleRefreshingAccessTokenService implements IAccessTokenService {
  private readonly service: IAccessTokenService
  
  constructor(service: IAccessTokenService) {
    this.service = service
  }
  
  async getAccessToken(): Promise<string> {
    return await this.service.getAccessToken()
  }
  
  async refreshAccessToken(accessToken: string): Promise<string> {
    const storedAccessToken = await this.getAccessToken()
    if (accessToken != storedAccessToken) {
      // Given access token is outdated so we use our stored access token.
      return storedAccessToken
    }
    // Given access token is stale so we refresh it.
    return await this.service.refreshAccessToken(accessToken)
  }
}