import { IEncryptionService } from "@/features/encrypt/EncryptionService"
import {
  Project,
  IProjectDataSource
} from "../domain"
import IAzureDevOpsRepositoryDataSource, {
  AzureDevOpsRepositoryWithRefs,
  AzureDevOpsRepositoryRef
} from "../domain/IAzureDevOpsRepositoryDataSource"
import ProjectMapper, { type URLBuilders } from "../domain/ProjectMapper"
import { IRemoteConfigEncoder } from "../domain/RemoteConfigEncoder"

const azureDevOpsURLBuilders: URLBuilders<AzureDevOpsRepositoryWithRefs> = {
  getImageRef(repository: AzureDevOpsRepositoryWithRefs): string {
    return repository.defaultBranchRef.name
  },
  getBlobRef(ref: AzureDevOpsRepositoryRef): string {
    return ref.name
  },
  getOwnerUrl(owner: string): string {
    return `https://dev.azure.com/${owner}`
  },
  getProjectUrl(repository: AzureDevOpsRepositoryWithRefs): string {
    return repository.webUrl
  },
  getVersionUrl(repository: AzureDevOpsRepositoryWithRefs, ref: AzureDevOpsRepositoryRef): string {
    return `${repository.webUrl}?version=GB${ref.name}`
  },
  getSpecEditUrl(repository: AzureDevOpsRepositoryWithRefs, ref: AzureDevOpsRepositoryRef, fileName: string): string {
    return `${repository.webUrl}?path=/${fileName}&version=GB${ref.name}&_a=contents`
  }
}

export default class AzureDevOpsProjectDataSource implements IProjectDataSource {
  private readonly repositoryDataSource: IAzureDevOpsRepositoryDataSource
  private readonly projectMapper: ProjectMapper<AzureDevOpsRepositoryWithRefs>

  constructor(config: {
    repositoryDataSource: IAzureDevOpsRepositoryDataSource
    repositoryNameSuffix: string
    encryptionService: IEncryptionService
    remoteConfigEncoder: IRemoteConfigEncoder
  }) {
    this.repositoryDataSource = config.repositoryDataSource
    this.projectMapper = new ProjectMapper({
      repositoryNameSuffix: config.repositoryNameSuffix,
      urlBuilders: azureDevOpsURLBuilders,
      encryptionService: config.encryptionService,
      remoteConfigEncoder: config.remoteConfigEncoder
    })
  }

  async getProjects(): Promise<Project[]> {
    const repositories = await this.repositoryDataSource.getRepositories()
    return this.projectMapper.mapRepositories(repositories)
  }
}
