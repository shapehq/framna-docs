import IGitHubClient, { OrganizationMembershipStatus } from "../github/IGitHubClient"
import ISessionValidator from "./ISessionValidator"

export default class GitHubOrganizationSessionValidator implements ISessionValidator {
  private readonly gitHubClient: IGitHubClient
  private readonly acceptedOrganization: string
  
  constructor(gitHubClient: IGitHubClient, acceptedOrganization: string) {
    this.gitHubClient = gitHubClient
    this.acceptedOrganization = acceptedOrganization
  }
  
  async validateSession(): Promise<boolean> {
    const status = await this.gitHubClient.getOrganizationMembershipStatus({
      organizationName: this.acceptedOrganization
    })
    return status == OrganizationMembershipStatus.ACTIVE
  }
}
