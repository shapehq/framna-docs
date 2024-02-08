import { AccountProviderType } from "@/common"
import SessionValidity from "./SessionValidity"

type OrganizationMembershipStatus = {
  readonly state: "active" | "pending"
}

interface IAccountProviderTypeReader {
  getAccountProviderType(): Promise<AccountProviderType>
}

interface IOrganizationMembershipStatusReader {
  getOrganizationMembershipStatus(
    request: { organizationName: string }
  ): Promise<OrganizationMembershipStatus>
}

export default class GitHubOrganizationSessionValidator {
  private readonly acceptedOrganization: string
  private readonly organizationMembershipStatusReader: IOrganizationMembershipStatusReader
  private readonly accountProviderTypeReader: IAccountProviderTypeReader
  
  constructor(
    config: {
      acceptedOrganization: string
      organizationMembershipStatusReader: IOrganizationMembershipStatusReader,
      accountProviderTypeReader: IAccountProviderTypeReader
    }
  ) {
    this.acceptedOrganization = config.acceptedOrganization
    this.organizationMembershipStatusReader = config.organizationMembershipStatusReader
    this.accountProviderTypeReader = config.accountProviderTypeReader
  }
  
  async validateSession(): Promise<SessionValidity> {
    const accountProviderType = await this.accountProviderTypeReader.getAccountProviderType()
    if (accountProviderType !== "github") {
      // Only validate GitHub sessions and consider any other valid.
      return SessionValidity.VALID
    }
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
