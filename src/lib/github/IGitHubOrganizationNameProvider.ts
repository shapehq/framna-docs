export interface IGitHubOrganizationNameProvider {
  getOrganizationName(): Promise<string>
}
