import ICredentialsTransferrer from "./ICredentialsTransferrer"

export interface IDataSource {
  getAccessToken(userId: string): Promise<string>
}

export interface IRepository {
  set(userId: string, token: string): Promise<void>
}

export type GuestCredentialsTransferrerConfig = {
  readonly dataSource: IDataSource
  readonly repository: IRepository
}

export default class GuestCredentialsTransferrer implements ICredentialsTransferrer {
  private readonly dataSource: IDataSource
  private readonly repository: IRepository
  
  constructor(config: GuestCredentialsTransferrerConfig) {
    this.dataSource = config.dataSource
    this.repository = config.repository
  }
  
  async transferCredentials(userId: string): Promise<void> {
    const newAccessToken = await this.dataSource.getAccessToken(userId)
    await this.repository.set(userId, newAccessToken)
  }
}
