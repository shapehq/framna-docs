import {
  GitHubRepository,
  IGitHubRepositoryDataSource,
  IGitHubLoginDataSource,
  IGitHubGraphQLClient,
} from "../domain";

type GraphQLGitHubRepository = {
  readonly name: string;
  readonly owner: {
    readonly login: string;
  };
  readonly defaultBranchRef: {
    readonly name: string;
    readonly target: {
      readonly oid: string;
    };
  };
  readonly configYml?: {
    readonly text: string;
  };
  readonly configYaml?: {
    readonly text: string;
  };
  readonly branches: EdgesContainer<GraphQLGitHubRepositoryRef>;
  readonly tags: EdgesContainer<GraphQLGitHubRepositoryRef>;
};

type EdgesContainer<T> = {
  readonly edges: Edge<T>[];
};

type Edge<T> = {
  readonly node: T;
};

type GraphQLGitHubRepositoryRef = {
  readonly name: string;
  readonly target: {
    readonly oid: string;
    readonly tree: {
      readonly entries: {
        readonly name: string;
      }[];
    };
  };
};

type GraphQLPullRequest = {
  readonly headRefName: string;
  readonly baseRefName: string;
  readonly baseRefOid: string;
};

export default class GitHubProjectDataSource
  implements IGitHubRepositoryDataSource
{
  private readonly loginsDataSource: IGitHubLoginDataSource;
  private readonly graphQlClient: IGitHubGraphQLClient;
  private readonly repositoryNameSuffix: string;
  private readonly projectConfigurationFilename: string;

  constructor(config: {
    loginsDataSource: IGitHubLoginDataSource;
    graphQlClient: IGitHubGraphQLClient;
    repositoryNameSuffix: string;
    projectConfigurationFilename: string;
  }) {
    this.loginsDataSource = config.loginsDataSource;
    this.graphQlClient = config.graphQlClient;
    this.repositoryNameSuffix = config.repositoryNameSuffix;
    this.projectConfigurationFilename =
      config.projectConfigurationFilename.replace(/\.ya?ml$/, "");
  }

  async getRepositories(): Promise<GitHubRepository[]> {
    const logins = await this.loginsDataSource.getLogins();
    return await this.getRepositoriesForLogins({ logins });
  }

  private async getRepositoriesForLogins({
    logins,
  }: {
    logins: string[];
  }): Promise<GitHubRepository[]> {
    let searchQueries: string[] = [];
    // Search for all private repositories the user has access to. This is needed to find
    // repositories for external collaborators who do not belong to an organization.
    searchQueries.push(`"${this.repositoryNameSuffix}" in:name is:private`);
    // Search for public repositories belonging to a user or organization.
    searchQueries = searchQueries.concat(
      logins.map((login) => {
        return `"${this.repositoryNameSuffix}" in:name user:${login} is:public`;
      })
    );
    return await Promise.all(
      searchQueries.map((searchQuery) => {
        return this.getRepositoriesForSearchQuery({ searchQuery });
      })
    )
      .then((e) => e.flat())
      .then((repositories) => {
        // GitHub's search API does not enable searching for repositories whose name ends with "-openapi",
        // only repositories whose names include "openapi" so we filter the results ourselves.
        return repositories.filter((repository) => {
          return repository.name.endsWith(this.repositoryNameSuffix);
        });
      })
      .then((repositories) => {
        // Ensure we don't have duplicates in the resulting repositories.
        const uniqueIdentifiers = new Set<string>();
        return repositories.filter((repository) => {
          const identifier = `${repository.owner.login}-${repository.name}`;
          const alreadyAdded = uniqueIdentifiers.has(identifier);
          uniqueIdentifiers.add(identifier);
          return !alreadyAdded;
        });
      })
      .then(async (repositories) => {
        // Fetch PRs for all repositories in a single query
        const allPullRequests = await this.getOpenPullRequestsForRepositories(
          repositories.map((repo) => ({
            owner: repo.owner.login,
            name: repo.name,
          }))
        );

        // Map from the internal model to the public model.
        return repositories.map((repository) => {
          const repoKey = `${repository.owner.login}/${repository.name}`;
          const pullRequests = allPullRequests.get(repoKey) || new Map();

          const branches = repository.branches.edges.map((branch) => {
            const pr = pullRequests.get(branch.node.name);

            return {
              id: branch.node.target.oid,
              name: branch.node.name,
              baseRef: pr?.baseRefName,
              baseRefOid: pr?.baseRefOid,
              files: branch.node.target.tree.entries,
            };
          });

          return {
            name: repository.name,
            owner: repository.owner.login,
            defaultBranchRef: {
              id: repository.defaultBranchRef.target.oid,
              name: repository.defaultBranchRef.name,
            },
            configYml: repository.configYml,
            configYaml: repository.configYaml,
            branches: branches,
            tags: repository.tags.edges.map((branch) => {
              return {
                id: branch.node.target.oid,
                name: branch.node.name,
                files: branch.node.target.tree.entries,
              };
            }),
          };
        });
      });
  }

  private async getOpenPullRequestsForRepositories(
    repositories: Array<{ owner: string; name: string }>
  ): Promise<Map<string, Map<string, GraphQLPullRequest>>> {
    if (repositories.length === 0) {
      return new Map();
    }

    // Build a query that fetches PRs for all repositories
    const repoQueries = repositories
      .map((repo, index) => {
        return `
        repo${index}: repository(owner: "${repo.owner}", name: "${repo.name}") {
          pullRequests(first: 100, states: [OPEN]) {
            edges {
              node {
                headRefName
                baseRefName
                baseRefOid
              }
            }
          }
        }`;
      })
      .join("\n");

    const request = {
      query: `
      query PullRequests {
        ${repoQueries}
      }
      `,
      variables: {},
    };

    const response = await this.graphQlClient.graphql(request);
    const allPullRequests = new Map<string, Map<string, GraphQLPullRequest>>();

    repositories.forEach((repo, index) => {
      const repoKey = `${repo.owner}/${repo.name}`;
      const repoData = response[`repo${index}`];
      const pullRequests = new Map<string, GraphQLPullRequest>();

      if (repoData?.pullRequests?.edges) {
        const pullRequestEdges =
          repoData.pullRequests.edges as Edge<GraphQLPullRequest>[];

        pullRequestEdges.forEach((edge) => {
          const pr = edge.node;
          pullRequests.set(pr.headRefName, {
            headRefName: pr.headRefName,
            baseRefName: pr.baseRefName,
            baseRefOid: pr.baseRefOid,
          });
        });
      }

      allPullRequests.set(repoKey, pullRequests);
    });

    return allPullRequests;
  }

  private async getRepositoriesForSearchQuery(params: {
    searchQuery: string;
    cursor?: string;
  }): Promise<GraphQLGitHubRepository[]> {
    const { searchQuery, cursor } = params;
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
      variables: { searchQuery, cursor },
    };
    const response = await this.graphQlClient.graphql(request);
    if (!response.search || !response.search.results) {
      return [];
    }
    const pageInfo = response.search.pageInfo;
    if (!pageInfo) {
      return response.search.results;
    }
    if (!pageInfo.hasNextPage || !pageInfo.endCursor) {
      return response.search.results;
    }
    const nextResults = await this.getRepositoriesForSearchQuery({
      searchQuery,
      cursor: pageInfo.endCursor,
    });
    return response.search.results.concat(nextResults);
  }
}
