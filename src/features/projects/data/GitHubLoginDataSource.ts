import {
  GitHubLogin,
  IGitHubLoginDataSource,
  IGitHubGraphQLClient
} from "../domain"

export default class GitHubLoginDataSource implements IGitHubLoginDataSource {
  private readonly graphQlClient: IGitHubGraphQLClient
  
  constructor(config: { graphQlClient: IGitHubGraphQLClient }) {
    this.graphQlClient = config.graphQlClient
  }
  
  async getLogins(): Promise<GitHubLogin[]> {
    const request = {
      query: `
      query {
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
    const personalLogin: GitHubLogin = {
      name: viewer.login
    }
    const organizationLogins: GitHubLogin[] = viewer
      .organizations
      .nodes
      .map((e: { login: string }) => {
        return { name: e.login }
      })
    return [personalLogin].concat(organizationLogins)
  }
}
