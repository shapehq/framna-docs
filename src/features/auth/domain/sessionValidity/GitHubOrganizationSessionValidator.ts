import SessionValidity from "./SessionValidity"

type OrganizationMembershipStatus = {
  readonly state: "active" | "pending"
}

interface IOrganizationMembershipStatusReader {
  getOrganizationMembershipStatus(
    request: { organizationName: string }
  ): Promise<OrganizationMembershipStatus>
}

export default class GitHubOrganizationSessionValidator {
  private readonly acceptedOrganization: string
  private readonly organizationMembershipStatusReader: IOrganizationMembershipStatusReader
  
  constructor(
    config: {
      acceptedOrganization: string
      organizationMembershipStatusReader: IOrganizationMembershipStatusReader
    }
  ) {
    this.acceptedOrganization = config.acceptedOrganization
    this.organizationMembershipStatusReader = config.organizationMembershipStatusReader
  }
  
  async validateSession(): Promise<SessionValidity> {
    try {
      const response = await this.organizationMembershipStatusReader.getOrganizationMembershipStatus({
        organizationName: this.acceptedOrganization
      })
      if (response.state == "active") {
        return SessionValidity.VALID
      } else {
        return SessionValidity.OUTSIDE_GITHUB_ORGANIZATION
      }
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      if (error.status) {
        if (error.status == 404) {
          return SessionValidity.OUTSIDE_GITHUB_ORGANIZATION
        } else if (error.status == 403) {
          return SessionValidity.GITHUB_APP_BLOCKED
        } else  {
          throw error
        }
      } else {
        throw error
      }
    }
  }
}
