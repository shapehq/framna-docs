import { ManagementClient } from "auth0"
import { UnauthorizedError } from "@/common/errors"

interface Auth0RefreshTokenReaderConfig {
  readonly domain: string
  readonly clientId: string
  readonly clientSecret: string
  readonly connection: string
}

export default class Auth0RefreshTokenReader {
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
      throw new UnauthorizedError(`No identity found for connection "${this.connection}"`)
    }
    return identity.refresh_token
  }
}
