import { ManagementClient } from "auth0"

type Auth0RepositoryAccessReaderConfig = {
  readonly domain: string
  readonly clientId: string
  readonly clientSecret: string
}

export default class Auth0RepositoryAccessReader {
  private readonly managementClient: ManagementClient
  
  constructor(config: Auth0RepositoryAccessReaderConfig) {
    this.managementClient = new ManagementClient({
      domain: config.domain,
      clientId: config.clientId,
      clientSecret: config.clientSecret
    }) 
  }
  
  async getRepositoryNames(userId: string): Promise<string[]> {
    const response = await this.managementClient.users.getRoles({ id: userId })
    return response.data.map(e => e.name)
  }
}
