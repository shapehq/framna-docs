import { AccountProvider } from "@/common"
import { OAuthToken } from ".."
import IOAuthTokenRefresher from "./IOAuthTokenRefresher"

interface IAccountProviderReader {
  getAccountProvider(): Promise<AccountProvider>
}

type Strategy = { [key in AccountProvider]: IOAuthTokenRefresher }

export default class AccountProviderStrategyOAuthTokenRefresher implements IOAuthTokenRefresher {
  private readonly accountProviderReader: IAccountProviderReader
  private readonly strategy: Strategy
  
  constructor(config: {
    accountProviderReader: IAccountProviderReader,
    strategy: Strategy
  }) {
    this.accountProviderReader = config.accountProviderReader
    this.strategy = config.strategy
  }
  
  async refreshOAuthToken(oldOAuthToken: OAuthToken): Promise<OAuthToken> {
    const accountProvider = await this.accountProviderReader.getAccountProvider()
    return await this.strategy[accountProvider].refreshOAuthToken(oldOAuthToken)
  }
}
