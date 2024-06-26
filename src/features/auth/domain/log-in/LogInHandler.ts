import { ILogInHandler, IUser, IAccount, IEmail } from "."
import { IGuestRepository, IUserRepository } from "@/features/admin/domain"

export default class LogInHandler implements ILogInHandler {
  private readonly userRepository: IUserRepository
  private readonly guestRepository: IGuestRepository
  
  constructor(config: {
    userRepository: IUserRepository,
    guestRepository: IGuestRepository
  }) {
    this.userRepository = config.userRepository
    this.guestRepository = config.guestRepository
  }
  
  async handleLogIn(user: IUser, account: IAccount | null, email?: IEmail) {
    if (!account) {
      return false
    }
    if (account.provider === "github") {
      return await this.handleLogInForGitHubUser(account)
    } else if (account.provider === "nodemailer") {
      return await this.handleLogInForGuestUser(user)
    } else {
      console.error("Unhandled account provider: " + account.provider)
      return false
    }
  }
  
  private async handleLogInForGitHubUser(account: IAccount) {
    if (!account.access_token) {
      return false
    }
    if (!account.refresh_token) {
      return false
    }
    return true
  }
  
  private async handleLogInForGuestUser(user: IUser) {
    if (!user.email) {
      return false
    }
    const existingUser = await this.userRepository.findByEmail(user.email)
    if (existingUser && existingUser.accounts.length > 0) {
      // The user is already authenticated with an identity provider,
      // so we'll ask them to use that instead.
      return "/api/auth/signin?error=OAuthAccountNotLinked"
    }
    const guest = await this.guestRepository.findByEmail(user.email)
    if (!guest) {
      // The e-mail address has not been invited as a guest.
      return false
    }
    return true
  }
}
