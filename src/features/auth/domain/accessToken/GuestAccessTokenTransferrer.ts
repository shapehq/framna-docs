import { ISession } from "@/common"
import { OAuthToken, IOAuthTokenRepository } from ".."

interface IGuest {
  readonly projects: string[]
}

interface IGitHubInstallationAccessTokenDataSource {
  getAccessToken(projects: string[]): Promise<string>
}

interface IGuestRepository {
  findByEmail(email: string): Promise<IGuest | undefined>
}

export default class GuestAccessTokenTransferrer {
  private readonly session: ISession
  private readonly guestRepository: IGuestRepository
  private readonly installationAccessTokenDataSource: IGitHubInstallationAccessTokenDataSource
  private readonly destinationOAuthTokenRepository: IOAuthTokenRepository
  
  constructor(
    config: {
      session: ISession,
      guestRepository: IGuestRepository,
      installationAccessTokenDataSource: IGitHubInstallationAccessTokenDataSource,
      destinationOAuthTokenRepository: IOAuthTokenRepository
    }
  ) {
    this.session = config.session
    this.guestRepository = config.guestRepository
    this.installationAccessTokenDataSource = config.installationAccessTokenDataSource
    this.destinationOAuthTokenRepository = config.destinationOAuthTokenRepository
  }
  
  async transferAccessToken(): Promise<string> {
    const userId = await this.session.getUserId()
    const email = await this.session.getEmail()
    const guest = await this.guestRepository.findByEmail(email)
    if (!guest) {
      throw new Error("The user was not found")
    }
    const accessToken = await this.installationAccessTokenDataSource.getAccessToken(guest.projects)
    const oauthToken: OAuthToken = { accessToken }
    await this.destinationOAuthTokenRepository.set(userId, oauthToken)
    return accessToken
  }
}
