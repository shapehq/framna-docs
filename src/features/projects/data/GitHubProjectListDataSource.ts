import {
  ProjectSummary,
  IProjectListDataSource,
  IGitHubLoginDataSource,
  IGitHubGraphQLClient,
  ProjectConfigParser
} from "../domain"

type GraphQLProjectListRepository = {
  readonly name: string
  readonly owner: {
    readonly login: string
  }
  readonly configYml?: {
    readonly text: string
  }
  readonly configYaml?: {
    readonly text: string
  }
}

export default class GitHubProjectListDataSource implements IProjectListDataSource {
  private readonly loginsDataSource: IGitHubLoginDataSource
  private readonly graphQlClient: IGitHubGraphQLClient
  private readonly repositoryNameSuffix: string
  private readonly projectConfigurationFilename: string

  constructor(config: {
    loginsDataSource: IGitHubLoginDataSource
    graphQlClient: IGitHubGraphQLClient
    repositoryNameSuffix: string
    projectConfigurationFilename: string
  }) {
    this.loginsDataSource = config.loginsDataSource
    this.graphQlClient = config.graphQlClient
    this.repositoryNameSuffix = config.repositoryNameSuffix
    this.projectConfigurationFilename = config.projectConfigurationFilename.replace(/\.ya?ml$/, "")
  }

  async getProjectList(): Promise<ProjectSummary[]> {
    const logins = await this.loginsDataSource.getLogins()
    const repositories = await this.getRepositoriesForLogins(logins)
    return repositories
      .map(repo => this.mapToSummary(repo))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  private async getRepositoriesForLogins(logins: string[]): Promise<GraphQLProjectListRepository[]> {
    const searchQueries: string[] = [
      `"${this.repositoryNameSuffix}" in:name is:private`,
      ...logins.map(login => `"${this.repositoryNameSuffix}" in:name user:${login} is:public`)
    ]

    const results = await Promise.all(
      searchQueries.map(query => this.searchRepositories(query))
    )

    const allRepos = results.flat()
    const uniqueRepos = this.deduplicateRepositories(allRepos)
    return uniqueRepos.filter(repo => repo.name.endsWith(this.repositoryNameSuffix))
  }

  private async searchRepositories(
    searchQuery: string,
    cursor?: string
  ): Promise<GraphQLProjectListRepository[]> {
    const request = {
      query: `
      query ProjectList($searchQuery: String!, $cursor: String) {
        search(query: $searchQuery, type: REPOSITORY, first: 100, after: $cursor) {
          results: nodes {
            ... on Repository {
              name
              owner { login }
              configYml: object(expression: "HEAD:${this.projectConfigurationFilename}.yml") {
                ... on Blob { text }
              }
              configYaml: object(expression: "HEAD:${this.projectConfigurationFilename}.yaml") {
                ... on Blob { text }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
      `,
      variables: { searchQuery, cursor }
    }

    const response = await this.graphQlClient.graphql(request)
    if (!response.search?.results) {
      return []
    }

    const pageInfo = response.search.pageInfo
    if (!pageInfo?.hasNextPage || !pageInfo?.endCursor) {
      return response.search.results
    }

    const nextResults = await this.searchRepositories(searchQuery, pageInfo.endCursor)
    return response.search.results.concat(nextResults)
  }

  private deduplicateRepositories(repos: GraphQLProjectListRepository[]): GraphQLProjectListRepository[] {
    const seen = new Set<string>()
    return repos.filter(repo => {
      const key = `${repo.owner.login}/${repo.name}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  private mapToSummary(repo: GraphQLProjectListRepository): ProjectSummary {
    const config = this.parseConfig(repo)
    const defaultName = repo.name.replace(new RegExp(this.repositoryNameSuffix + "$"), "")

    return {
      id: `${repo.owner.login}-${defaultName}`,
      name: defaultName,
      displayName: config?.name || defaultName,
      owner: repo.owner.login,
      imageURL: config?.image ? this.makeImageURL(repo.owner.login, repo.name, config.image) : undefined,
      url: `https://github.com/${repo.owner.login}/${repo.name}`,
      ownerUrl: `https://github.com/${repo.owner.login}`
    }
  }

  private parseConfig(repo: GraphQLProjectListRepository) {
    const yml = repo.configYml || repo.configYaml
    if (!yml?.text) return null
    const parser = new ProjectConfigParser()
    return parser.parse(yml.text)
  }

  private makeImageURL(owner: string, repo: string, imagePath: string): string {
    return `/api/blob/${owner}/${repo}/${encodeURIComponent(imagePath)}?ref=HEAD`
  }
}
