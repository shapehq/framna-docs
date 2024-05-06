import { ISession } from "@/common"
import IAccessTokenTransferrer from "./IAccessTokenTransferrer"

export default class AccessTokenTransferrer implements IAccessTokenTransferrer {
  private readonly session: ISession
  private readonly gitHubAccessTokenTransferrer: IAccessTokenTransferrer
  private readonly guestAccessTokenTransferrer: IAccessTokenTransferrer
  
  constructor(
    config: {
      session: ISession,
      gitHubAccessTokenTransferrer: IAccessTokenTransferrer,
      guestAccessTokenTransferrer: IAccessTokenTransferrer
    }
  ) {
    this.session = config.session
    this.gitHubAccessTokenTransferrer = config.gitHubAccessTokenTransferrer
    this.guestAccessTokenTransferrer = config.guestAccessTokenTransferrer
  }
  
  async transferAccessToken(): Promise<string> {
    const accountProviderType = await this.session.getAccountProviderType()
    switch (accountProviderType) {
    case "github":
      return await this.gitHubAccessTokenTransferrer.transferAccessToken()
    case "email":
      return await this.guestAccessTokenTransferrer.transferAccessToken()
    default:
      throw new Error(`Unsupported account provider type "${accountProviderType}"`)
    }
  }
}
