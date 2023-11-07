import ICredentialsTransferrer from "./ICredentialsTransferrer"
import IUserDataRepository from "@/common/userData/IUserDataRepository"

interface DataSource {
  getAccessToken(userId: string): Promise<string>
}

type Repository = IUserDataRepository<string>

type GuestCredentialsTransferrerConfig = {
  readonly dataSource: DataSource
  readonly repository: Repository
}

export default class GuestCredentialsTransferrer implements ICredentialsTransferrer {
  private readonly dataSource: DataSource
  private readonly repository: Repository
  
  constructor(config: GuestCredentialsTransferrerConfig) {
    this.dataSource = config.dataSource
    this.repository = config.repository
  }
  
  async transferCredentials(userId: string): Promise<void> {
    const accessToken = await this.dataSource.getAccessToken(userId)
    await this.repository.set(userId, accessToken)
  }
}
