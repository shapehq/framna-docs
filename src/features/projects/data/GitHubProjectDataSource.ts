import { IEncryptionService } from "@/features/encrypt/EncryptionService"
import {
  Project,
  Version,
  IProjectConfig,
  IProjectDataSource,
  ProjectConfigParser,
  ProjectConfigRemoteVersion,
  IGitHubRepositoryDataSource,
  GitHubRepository,
  GitHubRepositoryRef,
  ProjectConfigRemoteSpecification
} from "../domain"
import RemoteConfig from "../domain/RemoteConfig"
import { IRemoteConfigEncoder } from "../domain/RemoteConfigEncoder"

export default class GitHubProjectDataSource implements IProjectDataSource {
  private readonly repositoryDataSource: IGitHubRepositoryDataSource
  private readonly repositoryNameSuffix: string
  private readonly encryptionService: IEncryptionService
  private readonly remoteConfigEncoder: IRemoteConfigEncoder
  
  constructor(config: {
    repositoryDataSource: IGitHubRepositoryDataSource
    repositoryNameSuffix: string
    encryptionService: IEncryptionService
    remoteConfigEncoder: IRemoteConfigEncoder
  }) {
    this.repositoryDataSource = config.repositoryDataSource
    this.repositoryNameSuffix = config.repositoryNameSuffix
    this.encryptionService = config.encryptionService
    this.remoteConfigEncoder = config.remoteConfigEncoder
  }
  
  async getProjects(): Promise<Project[]> {
    const repositories = await this.repositoryDataSource.getRepositories()
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
  
  private mapProject(repository: GitHubRepository): Project {
    const config = this.getConfig(repository)
    let imageURL: string | undefined
    if (config && config.image) {
      imageURL = this.getGitHubBlobURL({
        ownerName: repository.owner,
        repositoryName: repository.name,
        path: config.image,
        ref: repository.defaultBranchRef.id
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
    const defaultName = repository.name.replace(new RegExp(this.repositoryNameSuffix + "$"), "")
    return {
      id: `${repository.owner}-${defaultName}`,
      owner: repository.owner,
      name: defaultName,
      displayName: config?.name || defaultName,
      versions,
      imageURL: imageURL,
      ownerUrl: `https://github.com/${repository.owner}`,
      url: `https://github.com/${repository.owner}/${repository.name}`
    }
  }
  
  private getConfig(repository: GitHubRepository): IProjectConfig | null {
    const yml = repository.configYml || repository.configYaml
    if (!yml || !yml.text || yml.text.length == 0) {
      return null
    }
    const parser = new ProjectConfigParser()
    return parser.parse(yml.text)
  }
  
  private getVersions(repository: GitHubRepository): Version[] {
    const branchVersions = repository.branches.map(branch => {
      const isDefaultRef = branch.name == repository.defaultBranchRef.name
      return this.mapVersionFromRef({
        ownerName: repository.owner,
        repositoryName: repository.name,
        ref: branch,
        isDefaultRef
      })
    })
    const tagVersions = repository.tags.map(tag => {
      return this.mapVersionFromRef({
        ownerName: repository.owner,
        repositoryName: repository.name,
        ref: tag
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
    ref: GitHubRepositoryRef
    isDefaultRef?: boolean
  }): Version {
    const specifications = ref.files.filter(file => {
      return this.isOpenAPISpecification(file.name)
    }).map(file => {
      return {
        id: file.name,
        name: file.name,
        url: this.getGitHubBlobURL({
          ownerName,
          repositoryName,
          path: file.name,
          ref: ref.id
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
        const remoteConfig: RemoteConfig = {
          url: e.url,
          auth: this.tryDecryptAuth(e)
        };

        const encodedRemoteConfig = this.remoteConfigEncoder.encode(remoteConfig);

        return {
          id: this.makeURLSafeID((e.id || e.name).toLowerCase()),
          name: e.name,
          url: `/api/remotes/${encodedRemoteConfig}`
        };
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

  private tryDecryptAuth(projectConfigRemoteSpec: ProjectConfigRemoteSpecification): { type: string, username: string, password: string } | undefined {
    if (!projectConfigRemoteSpec.auth) {
      return undefined
    }

    try {
      return {
        type: projectConfigRemoteSpec.auth.type,
        username: this.encryptionService.decrypt(projectConfigRemoteSpec.auth.encryptedUsername),
        password: this.encryptionService.decrypt(projectConfigRemoteSpec.auth.encryptedPassword)
      }
    } catch (error) {
      console.error(`Failed to decrypt remote specification auth for ${projectConfigRemoteSpec.url}. Perhaps a different public key was used?:`, error);
      return undefined
    }
  }
}
