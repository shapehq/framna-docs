export default interface IGitHubOrganizationNameProvider {
  getOrganizationName(): Promise<string>
}
