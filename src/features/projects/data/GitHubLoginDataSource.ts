import IGitHubLoginDataSource from "./IGitHubLoginDataSource"
import IGitHubGraphQLClient from "./IGitHubGraphQLClient"

export default class GitHubLoginDataSource implements IGitHubLoginDataSource {
  private readonly graphQlClient: IGitHubGraphQLClient
  
  constructor(config: { graphQlClient: IGitHubGraphQLClient }) {
    this.graphQlClient = config.graphQlClient
  }
  
  async getLogins(): Promise<string[]> {
    const request = {
      query: `query {
        viewer {
          login
          organizations(first: 100) {
            nodes {
              login
            }
          }
        }
      }`
    }
    const response = await this.graphQlClient.graphql(request)
    if (!response.viewer) {
      throw new Error("viewer property not found in response")
    }
    if (!response.viewer.login) {
      throw new Error("login property not found on viewer in response")
    }
    if (!response.viewer.organizations) {
      throw new Error("organizations property not found on viewer in response")
    }
    const viewer = response.viewer
    const organizations = viewer.organizations.nodes.map((e: { login: string }) => e.login)
    return [viewer.login].concat(organizations)
  }
}
