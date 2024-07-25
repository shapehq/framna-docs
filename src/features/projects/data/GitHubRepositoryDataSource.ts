import IGitHubLoginDataSource from "./IGitHubLoginDataSource"
import IGitHubGraphQLClient from "./IGitHubGraphQLClient"
import { GitHubRepository, IGitHubRepositoryDataSource } from "../domain"

type GraphQLGitHubRepository = {
  readonly name: string
  readonly owner: {
    readonly login: string
  }
  readonly defaultBranchRef: {
    readonly name: string
    readonly target: {
      readonly oid: string
    }
  }
  readonly configYml?: {
    readonly text: string
  }
  readonly configYaml?: {
    readonly text: string
  }
  readonly branches: EdgesContainer<GraphQLGitHubRepositoryRef>
  readonly tags: EdgesContainer<GraphQLGitHubRepositoryRef>
}

type EdgesContainer<T> = {
  readonly edges: Edge<T>[]
}

type Edge<T> = {
  readonly node: T
}

type GraphQLGitHubRepositoryRef = {
  readonly name: string
  readonly target: {
    readonly oid: string
    readonly tree: {
      readonly entries: {
        readonly name: string
      }[]
    }
  }
}

export default class GitHubProjectDataSource implements IGitHubRepositoryDataSource {
  private readonly loginsDataSource: IGitHubLoginDataSource
  private readonly graphQlClient: IGitHubGraphQLClient
  private readonly repositoryNameSuffix: string
  private readonly projectConfigurationFilename: string
  
  constructor(config: {
    loginsDataSource: IGitHubLoginDataSource,
    graphQlClient: IGitHubGraphQLClient,
    repositoryNameSuffix: string,
    projectConfigurationFilename: string
  }) {
    this.loginsDataSource = config.loginsDataSource
    this.graphQlClient = config.graphQlClient
    this.repositoryNameSuffix = config.repositoryNameSuffix
    this.projectConfigurationFilename = config.projectConfigurationFilename.replace(/\.ya?ml$/, "")
  }
  
  async getRepositories(): Promise<GitHubRepository[]> {
    const logins = await this.loginsDataSource.getLogins()
    return await this.getRepositoriesForLogins({ logins })
  }
  
  private async getRepositoriesForLogins({
    logins
  }: {
    logins: { name: string }[]
  }): Promise<GitHubRepository[]> {
    let searchQueries: string[] = []
    // Search for all private repositories the user has access to. This is needed to find
    // repositories for external collaborators who do not belong to an organization.
    searchQueries.push(`"${this.repositoryNameSuffix}" in:name is:private`)
    // Search for public repositories belonging to a user or organization.
    searchQueries = searchQueries.concat(logins.map(login => {
      return `"${this.repositoryNameSuffix}" in:name user:${login.name} is:public`
    }))
    return await Promise.all(searchQueries.map(searchQuery => {
      return this.getRepositoriesForSearchQuery({ searchQuery })
    }))
    .then(e => e.flat())
    .then(repositories => {
      // GitHub's search API does not enable searching for repositories whose name ends with "-openapi",
      // only repositories whose names include "openapi" so we filter the results ourselves.
      return repositories.filter(repository => {
        return repository.name.endsWith(this.repositoryNameSuffix)
      })
    })
    .then(repositories => {
      // Ensure we don't have duplicates in the resulting repositories.
      const uniqueIdentifiers = new Set<string>()
      return repositories.filter(repository => {
        const identifier = `${repository.owner.login}-${repository.name}`
        const alreadyAdded = uniqueIdentifiers.has(identifier)
        uniqueIdentifiers.add(identifier)
        return !alreadyAdded
      })
    })
    .then(repositories => {
      // Map from the internal model to the public model.
      return repositories.map(repository => {
        return {
          name: repository.name,
          owner: repository.owner.login,
          defaultBranchRef: {
            id: repository.defaultBranchRef.target.oid,
            name: repository.defaultBranchRef.name
          },
          configYml: repository.configYml,
          configYaml: repository.configYaml,
          branches: repository.branches.edges.map(branch => {
            return {
              id: branch.node.target.oid,
              name: branch.node.name,
              files: branch.node.target.tree.entries
            }
          }),
          tags: repository.tags.edges.map(branch => {
            return {
              id: branch.node.target.oid,
              name: branch.node.name,
              files: branch.node.target.tree.entries
            }
          })
        }
      })
    })
  }
  
  private async getRepositoriesForSearchQuery(params: {
    searchQuery: string,
    cursor?: string
  }): Promise<GraphQLGitHubRepository[]> {
    const { searchQuery, cursor } = params
    const request = {
      query: `
      query Repositories($searchQuery: String!, $cursor: String) {
        search(query: $searchQuery, type: REPOSITORY, first: 100, after: $cursor) {
          results: nodes {
            ... on Repository {
              name
              owner {
                login
              }
              defaultBranchRef {
                name
                target {
                  ...on Commit {
                    oid
                  }
                }
              }
              configYml: object(expression: "HEAD:${this.projectConfigurationFilename}.yml") {
                ...ConfigParts
              }
              configYaml: object(expression: "HEAD:${this.projectConfigurationFilename}.yaml") {
                ...ConfigParts
              }
              branches: refs(refPrefix: "refs/heads/", first: 100) {
                ...RefConnectionParts
              }
              tags: refs(refPrefix: "refs/tags/", first: 100) {
                ...RefConnectionParts
              }
            }
          }
          
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
      
      fragment RefConnectionParts on RefConnection {
        edges {
          node {
            name
            ... on Ref {
              name
              target {
                ... on Commit {
                  oid
                  tree {
                    entries {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      fragment ConfigParts on GitObject {
        ... on Blob {
          text
        }
      }
      `,
      variables: { searchQuery, cursor }
    }
    const response = await this.graphQlClient.graphql(request)
    if (!response.search || !response.search.results) {
      return []
    }
    const pageInfo = response.search.pageInfo
    if (!pageInfo) {
      return response.search.results
    }
    if (!pageInfo.hasNextPage || !pageInfo.endCursor) {
      return response.search.results
    }
    const nextResults = await this.getRepositoriesForSearchQuery({
      searchQuery,
      cursor: pageInfo.endCursor
    })
    return response.search.results.concat(nextResults)
  }
}
