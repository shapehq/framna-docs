import { ILogInHandler, IUser, IAccount, HandleLoginParams } from "."
import { IOAuthTokenRepository } from "../oauth-token"
import saneParseInt from "@/common/utils/saneParseInt"

export default class LogInHandler implements ILogInHandler {
  private readonly oauthTokenRepository: IOAuthTokenRepository
  
  constructor(config: { oauthTokenRepository: IOAuthTokenRepository }) {
    this.oauthTokenRepository = config.oauthTokenRepository
  }
  
  async handleLogIn({ user, account }: HandleLoginParams) {
    if (!account) {
      return false
    }
    if (account.provider === "github" || account.provider === "microsoft-entra-id") {
      return await this.handleLogInForOAuthUser({ user, account })
    } else {
      console.error("Unhandled account provider: " + account.provider)
      return false
    }
  }
  
  private async handleLogInForOAuthUser({ user, account }: { user: IUser, account: IAccount }) {
    if (!user.id) {
      return false
    }
    const accessToken = account.access_token
    const refreshToken = account.refresh_token
    if (!accessToken) {
      return false
    }
    if (!refreshToken) {
      return false
    }
    const userId = saneParseInt(user.id)
    if (!userId) {
      // We do not have a valid user ID, meaning this is the first time the user logs in.
      // When logging in for the first time, the user has a temporary ID that we cannot
      // look up in our database, so we rely on Auth.js to persist the access token and 
      // refresh token. This is intended according to Auth.js' documentation:
      // https://authjs.dev/reference/nextjs#signin
      return true
    }
    try {
      await this.oauthTokenRepository.set(`${userId}`, { accessToken, refreshToken })
      return true
    } catch {
      return false
    }
  }
}
