import IIsUserGuestReader from "./IIsUserGuestReader"
import IUserIdentityProviderReader from "./IUserIdentityProviderReader"
import UserIdentityProvider from "./UserIdentityProvider"

export default class IsUserGuestReader implements IIsUserGuestReader {
  private readonly userIdentityProviderReader: IUserIdentityProviderReader
  
  constructor(userIdentityProviderReader: IUserIdentityProviderReader) {
    this.userIdentityProviderReader = userIdentityProviderReader
  }
  
  async getIsUserGuest(userId: string): Promise<boolean> {
    const userIdentityProvider = await this.userIdentityProviderReader.getUserIdentityProvider(userId)
    return userIdentityProvider == UserIdentityProvider.USERNAME_PASSWORD
  }
}