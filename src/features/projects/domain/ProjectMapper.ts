import { IEncryptionService } from "@/features/encrypt/EncryptionService"
import {
  Project,
  Version,
  IProjectConfig,
  ProjectConfigParser,
  ProjectConfigRemoteVersion,
  ProjectConfigRemoteSpecification
} from "."
import RemoteConfig from "./RemoteConfig"
import { IRemoteConfigEncoder } from "./RemoteConfigEncoder"

type ConfigYml = { text: string } | null | undefined

/**
 * Common repository ref type
 */
export type RepositoryRef = {
  readonly id?: string
  readonly name: string
  readonly files: { readonly name: string }[]
  // Optional diff-related fields
  readonly baseRefOid?: string
  readonly baseRef?: string
  readonly prNumber?: number
}

/**
 * Common repository type.
 * Provider-specific fields should be added via intersection types in the data sources.
 */
export type RepositoryWithRefs = {
  readonly name: string
  readonly owner: string
  readonly defaultBranchRef: {
    readonly id?: string
    readonly name: string
  }
  readonly configYml?: { readonly text: string }
  readonly configYaml?: { readonly text: string }
  readonly branches: RepositoryRef[]
  readonly tags: RepositoryRef[]
}

/**
 * URL builders for provider-specific URL generation.
 * Generic parameter T allows providers to use extended repository types.
 */
export type URLBuilders<T extends RepositoryWithRefs = RepositoryWithRefs> = {
  /** Returns the ref to use for image URLs (e.g., defaultBranchRef.id or defaultBranchRef.name) */
  getImageRef(repository: T): string
  /** Returns the ref to use for blob URLs (e.g., ref.id or ref.name) */
  getBlobRef(ref: RepositoryRef): string
  /** Returns the owner URL (e.g., https://github.com/owner) */
  getOwnerUrl(owner: string): string
  /** Returns the project URL */
  getProjectUrl(repository: T): string
  /** Returns the version URL */
  getVersionUrl(repository: T, ref: RepositoryRef): string
  /** Returns the specification edit URL */
  getSpecEditUrl(repository: T, ref: RepositoryRef, fileName: string): string
  /** Optional: Returns the diff URL for a specification */
  getDiffUrl?(repository: T, ref: RepositoryRef, fileName: string): string | undefined
  /** Optional: Returns the PR URL */
  getPrUrl?(repository: T, ref: RepositoryRef): string | undefined
}

export interface IProjectMapper<T extends RepositoryWithRefs> {
  mapRepositories(repositories: T[]): Project[]
}

export default class ProjectMapper<T extends RepositoryWithRefs> implements IProjectMapper<T> {
  private readonly repositoryNameSuffix: string
  private readonly urlBuilders: URLBuilders<T>
  private readonly encryptionService: IEncryptionService
  private readonly remoteConfigEncoder: IRemoteConfigEncoder

  constructor(config: {
    repositoryNameSuffix: string
    urlBuilders: URLBuilders<T>
    encryptionService: IEncryptionService
    remoteConfigEncoder: IRemoteConfigEncoder
  }) {
    this.repositoryNameSuffix = config.repositoryNameSuffix
    this.urlBuilders = config.urlBuilders
    this.encryptionService = config.encryptionService
    this.remoteConfigEncoder = config.remoteConfigEncoder
  }

  mapRepositories(repositories: T[]): Project[] {
    return repositories
      .map(repository => this.mapRepositoryToProject(repository))
      .filter(project => project.versions.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  private mapRepositoryToProject(repository: T): Project {
    const config = this.parseConfig(repository.configYml, repository.configYaml)
    let imageURL: string | undefined
    if (config && config.image) {
      imageURL = getBlobURL(
        repository.owner,
        repository.name,
        config.image,
        this.urlBuilders.getImageRef(repository)
      )
    }

    const versions = this.sortVersions(
      this.addRemoteVersions(
        this.getVersions(repository),
        config?.remoteVersions || []
      ),
      repository.defaultBranchRef.name
    )
    .filter(version => version.specifications.length > 0)
    .map(version => this.setDefaultSpecification(version, config?.defaultSpecificationName))

    const defaultName = repository.name.replace(new RegExp(this.repositoryNameSuffix + "$"), "")
    return {
      id: `${repository.owner}-${defaultName}`,
      owner: repository.owner,
      name: defaultName,
      displayName: config?.name || defaultName,
      versions,
      imageURL: imageURL,
      ownerUrl: this.urlBuilders.getOwnerUrl(repository.owner),
      url: this.urlBuilders.getProjectUrl(repository)
    }
  }

  private parseConfig(configYml: ConfigYml, configYaml: ConfigYml): IProjectConfig | null {
    const yml = configYml || configYaml
    if (!yml || !yml.text || yml.text.length == 0) {
      return null
    }
    const parser = new ProjectConfigParser()
    return parser.parse(yml.text)
  }

  private getVersions(repository: T): Version[] {
    const branchVersions = repository.branches.map(branch => {
      const isDefaultRef = branch.name === repository.defaultBranchRef.name
      return this.mapVersionFromRef(repository, branch, isDefaultRef)
    })
    const tagVersions = repository.tags.map(tag => {
      return this.mapVersionFromRef(repository, tag, false)
    })
    return branchVersions.concat(tagVersions)
  }

  private mapVersionFromRef(
    repository: T,
    ref: RepositoryRef,
    isDefaultRef: boolean
  ): Version {
    const specifications = ref.files
      .filter(file => isOpenAPISpecification(file.name))
      .map(file => ({
        id: file.name,
        name: file.name,
        url: getBlobURL(repository.owner, repository.name, file.name, this.urlBuilders.getBlobRef(ref)),
        editURL: this.urlBuilders.getSpecEditUrl(repository, ref, file.name),
        diffURL: this.urlBuilders.getDiffUrl?.(repository, ref, file.name),
        diffBaseBranch: ref.baseRef,
        diffBaseOid: ref.baseRefOid,
        diffPrUrl: this.urlBuilders.getPrUrl?.(repository, ref),
        isDefault: false
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return {
      id: ref.name,
      name: ref.name,
      specifications: specifications,
      url: this.urlBuilders.getVersionUrl(repository, ref),
      isDefault: isDefaultRef
    }
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

  private setDefaultSpecification(version: Version, defaultSpecificationName?: string): Version {
    return {
      ...version,
      specifications: version.specifications.map(spec => ({
        ...spec,
        isDefault: spec.name === defaultSpecificationName
      }))
    }
  }

  private addRemoteVersions(
    existingVersions: Version[],
    remoteVersions: ProjectConfigRemoteVersion[]
  ): Version[] {
    const versions = [...existingVersions]
    const versionIds = versions.map(e => e.id)
    for (const remoteVersion of remoteVersions) {
      const baseVersionId = makeURLSafeID(
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
        }

        const encodedRemoteConfig = this.remoteConfigEncoder.encode(remoteConfig)

        return {
          id: makeURLSafeID((e.id || e.name).toLowerCase()),
          name: e.name,
          url: `/api/remotes/${encodedRemoteConfig}`,
          isDefault: false
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

  private tryDecryptAuth(
    projectConfigRemoteSpec: ProjectConfigRemoteSpecification
  ): { type: string, username: string, password: string } | undefined {
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
}

function isOpenAPISpecification(filename: string): boolean {
  return !filename.startsWith(".") && (
    filename.endsWith(".yml") || filename.endsWith(".yaml")
  )
}

function makeURLSafeID(str: string): string {
  return str
    .replace(/ /g, "-")
    .replace(/[^A-Za-z0-9-]/g, "")
}

export function getBlobURL(owner: string, repository: string, path: string, ref: string): string {
  const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/')
  return `/api/blob/${owner}/${repository}/${encodedPath}?ref=${ref}`
}
