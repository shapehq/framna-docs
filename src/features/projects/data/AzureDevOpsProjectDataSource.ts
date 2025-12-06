import { IEncryptionService } from "@/features/encrypt/EncryptionService"
import {
  Project,
  Version,
  IProjectConfig,
  IProjectDataSource,
  ProjectConfigParser,
  ProjectConfigRemoteVersion,
  ProjectConfigRemoteSpecification
} from "../domain"
import IAzureDevOpsRepositoryDataSource, {
  AzureDevOpsRepositoryWithRefs,
  AzureDevOpsRepositoryRef
} from "../domain/IAzureDevOpsRepositoryDataSource"
import RemoteConfig from "../domain/RemoteConfig"
import { IRemoteConfigEncoder } from "../domain/RemoteConfigEncoder"

export default class AzureDevOpsProjectDataSource implements IProjectDataSource {
  private readonly repositoryDataSource: IAzureDevOpsRepositoryDataSource
  private readonly repositoryNameSuffix: string
  private readonly encryptionService: IEncryptionService
  private readonly remoteConfigEncoder: IRemoteConfigEncoder

  constructor(config: {
    repositoryDataSource: IAzureDevOpsRepositoryDataSource
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

  private mapProject(repository: AzureDevOpsRepositoryWithRefs): Project {
    const config = this.getConfig(repository)
    let imageURL: string | undefined
    if (config && config.image) {
      imageURL = this.getAzureDevOpsBlobURL({
        organization: repository.owner,
        repositoryName: repository.name,
        path: config.image,
        ref: repository.defaultBranchRef.name
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
    .map(version => this.setDefaultSpecification(version, config?.defaultSpecificationName))

    const defaultName = repository.name.replace(new RegExp(this.repositoryNameSuffix + "$"), "")
    return {
      id: `${repository.owner}-${defaultName}`,
      owner: repository.owner,
      name: defaultName,
      displayName: config?.name || defaultName,
      versions,
      imageURL: imageURL,
      ownerUrl: `https://dev.azure.com/${repository.owner}`,
      url: repository.webUrl
    }
  }

  private getConfig(repository: AzureDevOpsRepositoryWithRefs): IProjectConfig | null {
    const yml = repository.configYml || repository.configYaml
    if (!yml || !yml.text || yml.text.length == 0) {
      return null
    }
    const parser = new ProjectConfigParser()
    return parser.parse(yml.text)
  }

  private getVersions(repository: AzureDevOpsRepositoryWithRefs): Version[] {
    const branchVersions = repository.branches.map(branch => {
      const isDefaultRef = branch.name == repository.defaultBranchRef.name
      return this.mapVersionFromRef({
        organization: repository.owner,
        repositoryName: repository.name,
        webUrl: repository.webUrl,
        ref: branch,
        isDefaultRef
      })
    })
    const tagVersions = repository.tags.map(tag => {
      return this.mapVersionFromRef({
        organization: repository.owner,
        repositoryName: repository.name,
        webUrl: repository.webUrl,
        ref: tag
      })
    })
    return branchVersions.concat(tagVersions)
  }

  private mapVersionFromRef({
    organization,
    repositoryName,
    webUrl,
    ref,
    isDefaultRef
  }: {
    organization: string
    repositoryName: string
    webUrl: string
    ref: AzureDevOpsRepositoryRef
    isDefaultRef?: boolean
  }): Version {
    const specifications = ref.files.filter(file => {
      return this.isOpenAPISpecification(file.name)
    }).map(file => {
      return {
        id: file.name,
        name: file.name,
        url: this.getAzureDevOpsBlobURL({
          organization,
          repositoryName,
          path: file.name,
          ref: ref.name
        }),
        // Azure DevOps edit URL format
        editURL: `${webUrl}?path=/${file.name}&version=GB${ref.name}&_a=contents`,
        isDefault: false // initial value
      }
    }).sort((a, b) => a.name.localeCompare(b.name))

    return {
      id: ref.name,
      name: ref.name,
      specifications: specifications,
      url: `${webUrl}?version=GB${ref.name}`,
      isDefault: isDefaultRef || false
    }
  }

  private isOpenAPISpecification(filename: string) {
    return !filename.startsWith(".") && (
      filename.endsWith(".yml") || filename.endsWith(".yaml")
    )
  }

  private getAzureDevOpsBlobURL({
    organization,
    repositoryName,
    path,
    ref
  }: {
    organization: string
    repositoryName: string
    path: string
    ref: string
  }): string {
    // Use internal API route for fetching blob content
    return `/api/blob/${organization}/${repositoryName}/${path}?ref=${ref}`
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
      const existingVersionIdCount = versionIds.filter(e => e == baseVersionId).length
      const versionId = baseVersionId + (existingVersionIdCount > 0 ? existingVersionIdCount : "")
      const specifications = remoteVersion.specifications.map(e => {
        const remoteConfig: RemoteConfig = {
          url: e.url,
          auth: this.tryDecryptAuth(e)
        }

        const encodedRemoteConfig = this.remoteConfigEncoder.encode(remoteConfig)

        return {
          id: this.makeURLSafeID((e.id || e.name).toLowerCase()),
          name: e.name,
          url: `/api/remotes/${encodedRemoteConfig}`,
          isDefault: false // initial value
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
      console.info(`Failed to decrypt remote specification auth for ${projectConfigRemoteSpec.name} (${projectConfigRemoteSpec.url}). Perhaps a different public key was used?:`, error)
      return undefined
    }
  }

  private setDefaultSpecification(version: Version, defaultSpecificationName?: string): Version {
    return {
      ...version,
      specifications: version.specifications.map(spec => ({
        ...spec,
        isDefault: spec.name === defaultSpecificationName
      }))
    }
  }
}
