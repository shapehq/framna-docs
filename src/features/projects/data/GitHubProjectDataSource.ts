import GitHubProjectRepository, {
  GitHubProjectRepositoryRef
} from "./GitHubProjectRepository"
import {
  Project,
  IProjectConfig,
  IProjectDataSource,
  Version, 
  ProjectConfigParser
} from "../domain"

interface IGitHubProjectRepositoryDataSource {
  getRepositories(): Promise<GitHubProjectRepository[]>
}

type GitHubProjectDataSourceConfig = {
  readonly dataSource: IGitHubProjectRepositoryDataSource
}

export default class GitHubProjectDataSource implements IProjectDataSource {
  private dataSource: IGitHubProjectRepositoryDataSource
  
  constructor(config: GitHubProjectDataSourceConfig) {
    this.dataSource = config.dataSource
  }
  
  async getProjects(): Promise<Project[]> {
    const repositories = await this.dataSource.getRepositories()
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
    const defaultName = repository.name.replace(/-openapi$/, "")
    return {
      id: defaultName,
      name: defaultName,
      displayName: config?.name || defaultName,
      versions: this.getVersions(repository).filter(version => {
        return version.specifications.length > 0
      }),
      imageURL: imageURL
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
    const defaultBranchName = repository.defaultBranchRef.name
    const candidateDefaultBranches = [
      defaultBranchName, "main", "master", "develop", "development"
    ]
    // Reverse them so the top-priority branches end up at the top of the list.
    .reverse()
    const allVersions = branchVersions.concat(tagVersions).sort((a: Version, b: Version) => {
      return a.name.localeCompare(b.name)
    })
    // Move the top-priority branches to the top of the list.
    for (const candidateDefaultBranch of candidateDefaultBranches) {
      const defaultBranchIndex = allVersions.findIndex((version: Version) => {
        return version.name === candidateDefaultBranch
      })
      if (defaultBranchIndex !== -1) {
        const branchVersion = allVersions[defaultBranchIndex]
        allVersions.splice(defaultBranchIndex, 1)
        allVersions.splice(0, 0, branchVersion)
      }
    }
    return allVersions
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
}
