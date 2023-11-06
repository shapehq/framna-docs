import IGitHubClient from "../github/IGitHubClient"
import ISessionValidator from "./ISessionValidator"

export default class GitHubOrganizationSessionValidator implements ISessionValidator {
  private readonly gitHubClient: IGitHubClient
  private readonly acceptedOrganization: string
  
  constructor(gitHubClient: IGitHubClient, acceptedOrganization: string) {
    this.gitHubClient = gitHubClient
    this.acceptedOrganization = acceptedOrganization
  }
  
  async validateSession(): Promise<boolean> {
    try {
      const response = await this.gitHubClient.getOrganizationMembershipStatus({
        organizationName: this.acceptedOrganization
      })
      return response.state == "active"
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      if (error.status) {
        if (error.status == 404) {
          return false
        } else if (error.status == 403) {
          return false
        } else  {
          throw error
        }
      } else {
        throw error
      }
    }
  }
}
