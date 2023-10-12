import { IUserProvider } from './IUserProvider'
import { IUserDetails } from './IUserDetails'
import { IUserDetailsProvider } from './IUserDetailsProvider'
import { ManagementClient } from 'auth0'

interface Auth0UserDetailsProviderConfig {
  domain: string
  clientId: string
  clientSecret: string
}

export class Auth0UserDetailsProvider implements IUserDetailsProvider {
  private userProvider: IUserProvider
  private config: Auth0UserDetailsProviderConfig
  
  constructor(userProvider: IUserProvider, config: Auth0UserDetailsProviderConfig) {
    this.userProvider = userProvider
    this.config = config
  }
  
  async getUserDetails(): Promise<IUserDetails> {
    const user = await this.userProvider.getUser()
    const managementClient = new ManagementClient({
      domain: this.config.domain,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret
    })
    const userResponse = await managementClient.users.get({ id: user.id })
    const identities = userResponse.data.identities.map(e => {
      return {
        provider: e.provider,
        accessToken: e.access_token
      }
    })
    return {identities}
  }
}
