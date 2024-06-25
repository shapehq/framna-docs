import { ILogInHandler, IAccount } from "."
import { IOAuthTokenRepository } from ".."

export default class LogInHandler implements ILogInHandler {
  private readonly oauthTokenRepository: IOAuthTokenRepository
  
  constructor(config: { oauthTokenRepository: IOAuthTokenRepository }) {
    this.oauthTokenRepository = config.oauthTokenRepository
  }
  
  async handleLogIn(userId: string, account?: IAccount): Promise<boolean> {
    if (!account) {
      return false
    }
    if (account.provider === "github") {
      return await this.handleLogInForGitHubUser(userId, account)
    } else if (account.provider === "nodemailer") {
      return true
    } else {
      console.error("Unhandled account provider: " + account.provider)
      return false
    }
  }
  
  private async handleLogInForGitHubUser(userId: string, account: IAccount): Promise<boolean> {
    if (!account.access_token) {
      return false
    }
    if (!account.refresh_token) {
      return false
    }
    try {
      await this.oauthTokenRepository.set(userId, {
        accessToken: account.access_token,
        refreshToken: account.refresh_token
      })
      return true
    } catch {
      return false
    }
  }
}
