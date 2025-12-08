import { IEncryptionService } from "@/features/encrypt/EncryptionService"
import {
  Project,
  IProjectDataSource
} from "../domain"
import IAzureDevOpsRepositoryDataSource, {
  AzureDevOpsRepositoryWithRefs
} from "../domain/IAzureDevOpsRepositoryDataSource"
import ProjectMapper, { type URLBuilders, type RepositoryRef } from "../domain/ProjectMapper"
import { IRemoteConfigEncoder } from "../domain/RemoteConfigEncoder"

const azureDevOpsURLBuilders: URLBuilders<AzureDevOpsRepositoryWithRefs> = {
  getImageRef(repository: AzureDevOpsRepositoryWithRefs): string {
    return repository.defaultBranchRef.name
  },
  getBlobRef(ref: RepositoryRef): string {
    return ref.name
  },
  getOwnerUrl(owner: string): string {
    return `https://dev.azure.com/${owner}`
  },
  getProjectUrl(repository: AzureDevOpsRepositoryWithRefs): string {
    return repository.webUrl
  },
  getVersionUrl(repository: AzureDevOpsRepositoryWithRefs, ref: RepositoryRef): string {
    return `${repository.webUrl}?version=GB${ref.name}`
  },
  getSpecEditUrl(repository: AzureDevOpsRepositoryWithRefs, ref: RepositoryRef, fileName: string): string {
    return `${repository.webUrl}?path=/${fileName}&version=GB${ref.name}&_a=contents`
  }
  // No getDiffUrl or getPrUrl - diff calculation is not supported for Azure DevOps
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
