import { IAccessTokenProvider } from "./IAccessTokenProvider"
import { IUserDetailsProvider } from "./IUserDetailsProvider"

export class IdentityAccessTokenProvider implements IAccessTokenProvider {
  private userDetailsProvider: IUserDetailsProvider
  private identityProvider: string
  
  constructor(
    userDetailsProvider: IUserDetailsProvider, 
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