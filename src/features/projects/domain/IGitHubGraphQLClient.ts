export type GitHubGraphQLClientRequest = {
  readonly query: string
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly variables?: {[key: string]: any}
}

export type GitHubGraphQLClientResponse = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly [key: string]: any
}

export default interface IGitHubGraphQLClient {
  graphql(request: GitHubGraphQLClientRequest): Promise<GitHubGraphQLClientResponse>
}
