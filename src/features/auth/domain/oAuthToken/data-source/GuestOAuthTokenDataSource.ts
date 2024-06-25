import { ISession } from "@/common"
import { IGuestRepository } from "@/features/admin/domain"
import { OAuthToken } from ".."
import IOAuthTokenDataSource from "./IOAuthTokenDataSource"

interface IGitHubInstallationAccessTokenDataSource {
  getAccessToken(repositoryNames: string[]): Promise<string>
}

export default class GuestOAuthTokenDataSource implements IOAuthTokenDataSource {
  private readonly session: ISession
  private readonly guestRepository: IGuestRepository
  private readonly gitHubInstallationAccessTokenDataSource: IGitHubInstallationAccessTokenDataSource
  
  constructor(config: {
    session: ISession,
    guestRepository: IGuestRepository,
    gitHubInstallationAccessTokenDataSource: IGitHubInstallationAccessTokenDataSource
  }) {
    this.session = config.session
    this.guestRepository = config.guestRepository
    this.gitHubInstallationAccessTokenDataSource = config.gitHubInstallationAccessTokenDataSource
  }
  
  async getOAuthToken(): Promise<OAuthToken> {
    const accountProvider = await this.session.getAccountProvider()
    if (accountProvider !== "email") {
      throw new Error(`Cannot get access token for accounts with the "${accountProvider}" provider.`)
    }
    const email = await this.session.getEmail()
    const repositoryNames = await this.guestRepository.getProjectsForEmail(email)
    const accessToken = await this.gitHubInstallationAccessTokenDataSource.getAccessToken(repositoryNames)
    return { accessToken }
  }
}
