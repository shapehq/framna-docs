import { UserProviding } from './UserProviding'
import { UserDetails } from './UserDetails'
import { UserDetailsProviding } from './UserDetailsProviding'
import { ManagementClient } from 'auth0'

interface Auth0UserDetailsProviderConfig {
  domain: string
  clientId: string
  clientSecret: string
}

export class Auth0UserDetailsProvider implements UserDetailsProviding {
  private userProvider: UserProviding
  private config: Auth0UserDetailsProviderConfig
  
  constructor(userProvider: UserProviding, config: Auth0UserDetailsProviderConfig) {
    this.userProvider = userProvider
    this.config = config
  }
  
  async getUserDetails(): Promise<UserDetails> {
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
