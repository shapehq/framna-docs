import GitHubProjectRepository, {
  GitHubProjectRepositoryRef
} from "./GitHubProjectRepository"
import IGitHubLoginDataSource from "./IGitHubLoginDataSource"
import IGitHubGraphQLClient from "./IGitHubGraphQLClient"
import {
  Project,
  Version,
  IProjectConfig,
  IProjectDataSource,
  ProjectConfigParser,
  ProjectConfigRemoteVersion
} from "../domain"

export default class GitHubProjectDataSource implements IProjectDataSource {
  private readonly loginsDataSource: IGitHubLoginDataSource
  private readonly graphQlClient: IGitHubGraphQLClient
  private readonly projectConfigurationFilename: string
  
  constructor(config: {
    loginsDataSource: IGitHubLoginDataSource,
    graphQlClient: IGitHubGraphQLClient,
    projectConfigurationFilename: string
  }) {
    this.loginsDataSource = config.loginsDataSource
    this.graphQlClient = config.graphQlClient
    this.projectConfigurationFilename = config.projectConfigurationFilename.replace(/\.ya?ml$/, "")
  }
  
  async getProjects(): Promise<Project[]> {
    const logins = await this.loginsDataSource.getLogins()
    const repositories = await this.getRepositories({ logins })
    return repositories.map(repository => {
      return this.mapProject(repository)
    })
    .filter((project: Project) => {
      return project.versions.length > 0
    })
    .sort((a: Project, b: Project) => {
      return a.name.localeCompare(b.name)
    })
  }
  
  private mapProject(repository: GitHubProjectRepository): Project {
    const config = this.getConfig(repository)
    let imageURL: string | undefined
    if (config && config.image) {
      imageURL = this.getGitHubBlobURL({
        ownerName: repository.owner.login,
        repositoryName: repository.name,
        path: config.image,
        ref: repository.defaultBranchRef.target.oid
      })
    }
    const versions = this.sortVersions(
      this.addRemoteVersions(
        this.getVersions(repository),
        config?.remoteVersions || []
      ),
      repository.defaultBranchRef.name
    ).filter(version => {
      return version.specifications.length > 0
    })
    const defaultName = repository.name.replace(/-openapi$/, "")
    return {
      id: `${repository.owner.login}-${defaultName}`,
      owner: repository.owner.login,
      name: defaultName,
      displayName: config?.name || defaultName,
      versions,
      imageURL: imageURL,
      ownerUrl: `https://github.com/${repository.owner.login}`,
      url: `https://github.com/${repository.owner.login}/${repository.name}`
    }
  }
  
  private getConfig(repository: GitHubProjectRepository): IProjectConfig | null {
    const yml = repository.configYml || repository.configYaml
    if (!yml || !yml.text || yml.text.length == 0) {
      return null
    }
    const parser = new ProjectConfigParser()
    return parser.parse(yml.text)
  }
  
  private getVersions(repository: GitHubProjectRepository): Version[] {
    const branchVersions = repository.branches.edges.map(edge => {
      const isDefaultRef = edge.node.name == repository.defaultBranchRef.name
      return this.mapVersionFromRef({
        ownerName: repository.owner.login,
        repositoryName: repository.name,
        ref: edge.node,
        isDefaultRef
      })
    })
    const tagVersions = repository.tags.edges.map(edge => {
      return this.mapVersionFromRef({
        ownerName: repository.owner.login,
        repositoryName: repository.name,
        ref: edge.node
      })
    })
    return branchVersions.concat(tagVersions)
  }
  
  private mapVersionFromRef({
    ownerName,
    repositoryName,
    ref,
    isDefaultRef
  }: {
    ownerName: string
    repositoryName: string
    ref: GitHubProjectRepositoryRef
    isDefaultRef?: boolean
  }): Version {
    const specifications = ref.target.tree.entries.filter(file => {
      return this.isOpenAPISpecification(file.name)
    }).map(file => {
      return {
        id: file.name,
        name: file.name,
        url: this.getGitHubBlobURL({
          ownerName,
          repositoryName,
          path: file.name,
          ref: ref.target.oid
        }),
        editURL: `https://github.com/${ownerName}/${repositoryName}/edit/${ref.name}/${file.name}`
      }
    })
    return {
      id: ref.name,
      name: ref.name,
      specifications: specifications,
      url: `https://github.com/${ownerName}/${repositoryName}/tree/${ref.name}`,
      isDefault: isDefaultRef || false
    }
  }

  private isOpenAPISpecification(filename: string) {
    return !filename.startsWith(".") && (
      filename.endsWith(".yml") || filename.endsWith(".yaml")
    )
  }
  
  private getGitHubBlobURL({
    ownerName,
    repositoryName,
    path,
    ref
  }: {
    ownerName: string
    repositoryName: string
    path: string
    ref: string
  }): string {
    return `/api/blob/${ownerName}/${repositoryName}/${path}?ref=${ref}`
  }
  
  private addRemoteVersions(
    existingVersions: Version[],
    remoteVersions: ProjectConfigRemoteVersion[]
  ): Version[] {
    const versions = [...existingVersions]
    const versionIds = versions.map(e => e.id)
    for (const remoteVersion of remoteVersions) {
      const baseVersionId = this.makeURLSafeID(
        (remoteVersion.id || remoteVersion.name).toLowerCase()
      )
      // If the version ID exists then we suffix it with a number to ensure unique versions.
      // E.g. if "foo" already exists, we make it "foo1".
      const existingVersionIdCount = versionIds.filter(e => e == baseVersionId).length
      const versionId = baseVersionId + (existingVersionIdCount > 0 ? existingVersionIdCount : "")
      const specifications = remoteVersion.specifications.map(e => {
        return {
          id: this.makeURLSafeID((e.id || e.name).toLowerCase()),
          name: e.name,
          url: `/api/proxy?url=${encodeURIComponent(e.url)}`
        }
      })
      versions.push({
        id: versionId,
        name: remoteVersion.name,
        specifications,
        isDefault: false
      })
      versionIds.push(baseVersionId)
    }
    return versions
  }
  
  private sortVersions(versions: Version[], defaultBranchName: string): Version[] {
    const candidateDefaultBranches = [
      defaultBranchName, "main", "master", "develop", "development", "trunk"
    ]
    // Reverse them so the top-priority branches end up at the top of the list.
    .reverse()
    const copiedVersions = [...versions].sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
    // Move the top-priority branches to the top of the list.
    for (const candidateDefaultBranch of candidateDefaultBranches) {
      const defaultBranchIndex = copiedVersions.findIndex(version => {
        return version.name === candidateDefaultBranch
      })
      if (defaultBranchIndex !== -1) {
        const branchVersion = copiedVersions[defaultBranchIndex]
        copiedVersions.splice(defaultBranchIndex, 1)
        copiedVersions.splice(0, 0, branchVersion)
      }
    }
    return copiedVersions
  }
  
  private makeURLSafeID(str: string): string {
    return str
      .replace(/ /g, "-")
      .replace(/[^A-Za-z0-9-]/g, "")
  }
  
  private async getRepositories({ logins }: { logins: string[] }): Promise<GitHubProjectRepository[]> {
    let searchQueries: string[] = []
    // Search for all private repositories the user has access to. This is needed to find
    // repositories for external collaborators who do not belong to an organization.
    searchQueries.push("openapi in:name is:private")
    // Search for public repositories belonging to a user or organization.
    searchQueries = searchQueries.concat(logins.map(login => `openapi in:name user:${login} is:public`))
    return await Promise.all(searchQueries.map(searchQuery => {
      return this.getRepositoriesForSearchQuery({ searchQuery })
    }))
    .then(e => e.flat())
    .then(repositories => {
      // GitHub's search API does not enable searching for repositories whose name ends with "-openapi",
      // only repositories whose names include "openapi" so we filter the results ourselves.
      return repositories.filter(repository => {
        return repository.name.endsWith("-openapi")
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
  }
  
  private async getRepositoriesForSearchQuery(params: {
    searchQuery: string,
    cursor?: string
  }): Promise<GitHubProjectRepository[]> {
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
    if (!response.search || !response.search.results || !response.search.pageInfo) {
      return []
    }
    const pageInfo = response.search.pageInfo
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
