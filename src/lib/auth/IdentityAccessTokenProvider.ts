import { AccessTokenProviding } from "./AccessTokenProviding"
import { UserDetailsProviding } from "./UserDetailsProviding"

export class IdentityAccessTokenProvider implements AccessTokenProviding {
  private userDetailsProvider: UserDetailsProviding
  private identityProvider: string
  
  constructor(
    userDetailsProvider: UserDetailsProviding, 
    identityProvider: string
  ) {
    this.userDetailsProvider = userDetailsProvider
    this.identityProvider = identityProvider
  }
  
  async getAccessToken(): Promise<string> {
    const userDetails = await this.userDetailsProvider.getUserDetails()
    const identity = userDetails.identities.find(e => {
      return e.provider.toLowerCase() === this.identityProvider.toLowerCase()
    })
    if (!identity) {
      throw new Error("No identity found for provider '" + this.identityProvider + "'")
    }
    return identity.accessToken
  }
}