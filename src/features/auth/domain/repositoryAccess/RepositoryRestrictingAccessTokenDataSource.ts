interface IRepositoryAccessReader {
  getRepositoryNames(userId: string): Promise<string[]>
}

interface IAccessTokenDataSource {
  getAccessToken(repositoryNames: string[]): Promise<string>
}

type RepositoryRestrictingAccessTokenDataSourceConfig = {
  readonly repositoryAccessReader: IRepositoryAccessReader
  readonly dataSource: IAccessTokenDataSource
}

export default class RepositoryRestrictingAccessTokenDataSource {
  private readonly repositoryAccessReader: IRepositoryAccessReader
  private readonly dataSource: IAccessTokenDataSource
  
  constructor(config: RepositoryRestrictingAccessTokenDataSourceConfig) {
    this.repositoryAccessReader = config.repositoryAccessReader
    this.dataSource = config.dataSource
  }
  
  async getAccessToken(userId: string): Promise<string> {
    const repositoryNames = await this.repositoryAccessReader.getRepositoryNames(userId)
    return await this.dataSource.getAccessToken(repositoryNames)
  }
}
