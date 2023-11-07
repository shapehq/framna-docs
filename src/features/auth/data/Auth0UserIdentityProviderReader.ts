import { ManagementClient } from "auth0"
import UserIdentityProvider from "../domain/userIdentityProvider/UserIdentityProvider"
import IUserIdentityProviderReader from "../domain/userIdentityProvider/IUserIdentityProviderReader"
import { UnauthorizedError } from "@/common/errors"

interface Auth0UserIdentityProviderReaderConfig {
  readonly domain: string
  readonly clientId: string
  readonly clientSecret: string
}

export default class Auth0UserIdentityProviderReader implements IUserIdentityProviderReader {
  private readonly managementClient: ManagementClient
  
  constructor(config: Auth0UserIdentityProviderReaderConfig) {
    this.managementClient = new ManagementClient({
      domain: config.domain,
      clientId: config.clientId,
      clientSecret: config.clientSecret
    }) 
  }
  
  async getUserIdentityProvider(userId: string): Promise<UserIdentityProvider> {
    const response = await this.managementClient.users.get({ id: userId })
    const identities = response.data.identities
    const gitHubIdentity = identities.find(e => {
      return e.connection.toLowerCase() === "github"
    })
    const usernamePasswordIdentity = identities.find(e => {
      return e.connection.toLowerCase() === "username-password-authentication"
    })
    if (gitHubIdentity) {
      return UserIdentityProvider.GITHUB
    } else if (usernamePasswordIdentity) {
      return UserIdentityProvider.USERNAME_PASSWORD
    } else {
      throw new UnauthorizedError()
    }
  }
}
