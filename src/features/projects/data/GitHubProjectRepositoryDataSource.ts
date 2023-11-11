import GitHubProjectRepository from "./GitHubProjectRepository"

export type GitHubGraphQLClientRequest = {
  readonly query: string
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  readonly variables: {[key: string]: any}
}

export type GitHubGraphQLClientResponse = {
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  readonly [key: string]: any
}

interface IGitHubGraphQLClient {
  graphql(request: GitHubGraphQLClientRequest): Promise<GitHubGraphQLClientResponse>
}

type GitHubProjectRepositoryDataSourceConfig = {
  readonly graphQlClient: IGitHubGraphQLClient
  readonly organizationName: string
}

export default class GitHubProjectRepositoryDataSource {
  private graphQlClient: IGitHubGraphQLClient
  private organizationName: string
  
  constructor(config: GitHubProjectRepositoryDataSourceConfig) {
    this.graphQlClient = config.graphQlClient
    this.organizationName = config.organizationName
  }
  
  async getRepositories(): Promise<GitHubProjectRepository[]> {
    const request = {
      query: `
      query Repositories($searchQuery: String!) {
        search(query: $searchQuery, type: REPOSITORY, first: 100) {
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
              configYml: object(expression: "HEAD:.shape-docs.yml") {
                ...ConfigParts
              }
              configYaml: object(expression: "HEAD:.shape-docs.yaml") {
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
      variables: {
        searchQuery: `org:${this.organizationName} openapi in:name`
      }
    }
    const response = await this.graphQlClient.graphql(request)
    return response.search.results
  }
}
