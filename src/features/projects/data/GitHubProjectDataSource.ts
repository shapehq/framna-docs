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
    return repository.defaultBranchRef.id!
  },
  getBlobRef(ref: RepositoryRef): string {
    return ref.id!
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
    return `https://github.com/${repository.owner}/${repository.name}/edit/${ref.name}/${fileName}`
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
