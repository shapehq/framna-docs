import { ManagementClient } from "auth0"

type Auth0MetadataUpdaterConfig = {
  readonly domain: string
  readonly clientId: string
  readonly clientSecret: string
}

export default class Auth0MetadataUpdater {
  private readonly managementClient: ManagementClient
  
  constructor(config: Auth0MetadataUpdaterConfig) {
    this.managementClient = new ManagementClient({
      domain: config.domain,
      clientId: config.clientId,
      clientSecret: config.clientSecret
    }) 
  }
  
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  async updateMetadata(userId: string, metadata: {[key: string]: any}): Promise<void> {
    await this.managementClient.users.update({
      id: userId
    }, {
      app_metadata: metadata
    })
  }
}
