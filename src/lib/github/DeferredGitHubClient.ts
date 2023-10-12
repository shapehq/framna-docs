import { IAccessTokenProvider } from "@/lib/auth/IAccessTokenProvider" 
import { IGitHubOrganizationNameProvider } from "./IGitHubOrganizationNameProvider"
import { IGitHubClient } from "./IGitHubClient"
import { IGitHubBranch } from "./IGitHubBranch"
import { IGitHubRepository } from "./IGitHubRepository"
import { IGitHubTag } from "./IGitHubTag"

type GitHubClientFactory = (organizationName: string, accessToken: string) => IGitHubClient

export class DeferredGitHubClient implements IGitHubClient {
  private organizationNameProvider: IGitHubOrganizationNameProvider
  private accessTokenProvider: IAccessTokenProvider
  private gitHubClientFactory: GitHubClientFactory
  private gitHubClient?: IGitHubClient
  
  constructor(
    organizationNameProvider: IGitHubOrganizationNameProvider,
    accessTokenProvider: IAccessTokenProvider,
    gitHubClientFactory: GitHubClientFactory
  ) {
    this.organizationNameProvider = organizationNameProvider
    this.accessTokenProvider = accessTokenProvider
    this.gitHubClientFactory = gitHubClientFactory
  }
  
  async getRepositories(suffix: string): Promise<IGitHubRepository[]> {
    const gitHubClient = await this.getGitHubClient()
    return await gitHubClient.getRepositories(suffix)
  }
  
  async getBranches(owner: string, repository: string): Promise<IGitHubBranch[]> {
    const gitHubClient = await this.getGitHubClient()
    return await gitHubClient.getBranches(owner, repository)
  }
  
  async getTags(owner: string, repository: string): Promise<IGitHubTag[]> {
    const gitHubClient = await this.getGitHubClient()
    return await gitHubClient.getTags(owner, repository)
  }
  
  private async getGitHubClient(): Promise<IGitHubClient> {
    if (this.gitHubClient != null) {
      return this.gitHubClient
    } else {
      const organizationName = await this.organizationNameProvider.getOrganizationName()
      const accessToken = await this.accessTokenProvider.getAccessToken()
      const gitHubClient = this.gitHubClientFactory(
        organizationName,
        accessToken
      )
      this.gitHubClient = gitHubClient
      return gitHubClient
    }
  }
}
