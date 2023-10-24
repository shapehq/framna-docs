import { ManagementClient } from "auth0"
import IRefreshTokenReader from "../domain/IRefreshTokenReader"

interface Auth0RefreshTokenReaderConfig {
  domain: string
  clientId: string
  clientSecret: string
  connection: string
}

export default class Auth0RefreshTokenReader implements IRefreshTokenReader {
  private readonly managementClient: ManagementClient
  private readonly connection: string
  
  constructor(config: Auth0RefreshTokenReaderConfig) {
    this.connection = config.connection
    this.managementClient = new ManagementClient({
      domain: config.domain,
      clientId: config.clientId,
      clientSecret: config.clientSecret
    }) 
  }
  
  async getRefreshToken(userId: string): Promise<string> {
    const userResponse = await this.managementClient.users.get({ id: userId })
    const identity = userResponse.data.identities.find(identity => {
      return identity.connection.toLowerCase() == this.connection.toLowerCase()
    })
    if (!identity) {
      throw new Error(`No identity found for connection "${this.connection}"`)
    }
    return identity.refresh_token
  }
}
