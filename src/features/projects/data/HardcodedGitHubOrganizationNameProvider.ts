import IGitHubOrganizationNameProvider from "./IGitHubOrganizationNameProvider"

export default class HardcodedGitHubOrganizationNameProvider implements IGitHubOrganizationNameProvider {
  private organizationName: string
  
  constructor(organizationName: string) {
    this.organizationName = organizationName
  }
  
  async getOrganizationName(): Promise<string> {
    return this.organizationName
  }
}
