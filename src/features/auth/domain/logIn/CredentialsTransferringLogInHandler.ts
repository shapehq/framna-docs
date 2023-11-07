import ICredentialsTransferrer from "../credentialsTransfer/ICredentialsTransferrer"
import IIsUserGuestReader from "../userIdentityProvider/IIsUserGuestReader"
import ILogInHandler from "./ILogInHandler"

export interface IRefreshTokenReader {
  getRefreshToken(userId: string): Promise<string>
}

type CredentialsTransferringLogInHandlerConfig = {
  readonly isUserGuestReader: IIsUserGuestReader
  readonly guestCredentialsTransferrer: ICredentialsTransferrer
  readonly hostCredentialsTransferrer: ICredentialsTransferrer
}

export default class CredentialsTransferringLogInHandler implements ILogInHandler {
  private readonly isUserGuestReader: IIsUserGuestReader
  private readonly guestCredentialsTransferrer: ICredentialsTransferrer
  private readonly hostCredentialsTransferrer: ICredentialsTransferrer
  
  constructor(config: CredentialsTransferringLogInHandlerConfig) {
    this.isUserGuestReader = config.isUserGuestReader
    this.guestCredentialsTransferrer = config.guestCredentialsTransferrer
    this.hostCredentialsTransferrer = config.hostCredentialsTransferrer
  }
  
  async handleLogIn(userId: string): Promise<void> {
    const isGuest = await this.isUserGuestReader.getIsUserGuest(userId)
    if (isGuest) {
      this.guestCredentialsTransferrer.transferCredentials(userId)
    } else {
      this.hostCredentialsTransferrer.transferCredentials(userId)
    }
  }
}
