import { IEncryptionService } from "@/features/encrypt/EncryptionService"
import {
  Project,
  IProjectDataSource,
  IGitHubRepositoryDataSource
} from "../domain"
import ProjectMapper, { type URLBuilders, type RepositoryWithRefs, type RepositoryRef } from "../domain/ProjectMapper"
import { IRemoteConfigEncoder } from "../domain/RemoteConfigEncoder"

const gitHubURLBuilders: URLBuilders<RepositoryWithRefs> = {
  getImageRef(repository: RepositoryWithRefs): string {
    // GitHub always provides an id for branches; fall back to name if not present
    return repository.defaultBranchRef.id ?? repository.defaultBranchRef.name
  },
  getBlobRef(ref: RepositoryRef): string {
    // GitHub always provides an id for refs; fall back to name if not present
    return ref.id ?? ref.name
  },
  getOwnerUrl(owner: string): string {
    return `https://github.com/${owner}`
  },
  getProjectUrl(repository: RepositoryWithRefs): string {
    return `https://github.com/${repository.owner}/${repository.name}`
  },
  getVersionUrl(repository: RepositoryWithRefs, ref: RepositoryRef): string {
    return `https://github.com/${repository.owner}/${repository.name}/tree/${ref.name}`
  },
  getSpecEditUrl(repository: RepositoryWithRefs, ref: RepositoryRef, fileName: string): string {
    return `https://github.com/${repository.owner}/${repository.name}/edit/${ref.name}/${encodeURIComponent(fileName)}`
  },
  getDiffUrl(repository: RepositoryWithRefs, ref: RepositoryRef, fileName: string): string | undefined {
    if (!ref.baseRefOid) {
      return undefined
    }
    const toRef = ref.id ?? ref.name
    const encodedPath = fileName.split('/').map(segment => encodeURIComponent(segment)).join('/')
    return `/api/diff/${repository.owner}/${repository.name}/${encodedPath}?baseRefOid=${ref.baseRefOid}&to=${toRef}`
  },
  getPrUrl(repository: RepositoryWithRefs, ref: RepositoryRef): string | undefined {
    if (!ref.prNumber) {
      return undefined
    }
    return `https://github.com/${repository.owner}/${repository.name}/pull/${ref.prNumber}`
  }
}

export default class GitHubProjectDataSource implements IProjectDataSource {
  private readonly repositoryDataSource: IGitHubRepositoryDataSource
  private readonly projectMapper: ProjectMapper<RepositoryWithRefs>

  constructor(config: {
    repositoryDataSource: IGitHubRepositoryDataSource
    repositoryNameSuffix: string
    encryptionService: IEncryptionService
    remoteConfigEncoder: IRemoteConfigEncoder
  }) {
    this.repositoryDataSource = config.repositoryDataSource
    this.projectMapper = new ProjectMapper({
      repositoryNameSuffix: config.repositoryNameSuffix,
      urlBuilders: gitHubURLBuilders,
      encryptionService: config.encryptionService,
      remoteConfigEncoder: config.remoteConfigEncoder
    })
  }

  async getProjects(): Promise<Project[]> {
    const repositories = await this.repositoryDataSource.getRepositories()
    return this.projectMapper.mapRepositories(repositories)
  }
}
