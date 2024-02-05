import ICredentialsTransferrer from "../credentialsTransfer/ICredentialsTransferrer"
import IIsUserGuestReader from "../guest/IIsUserGuestReader"
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
    try {
      const isGuest = await this.isUserGuestReader.getIsUserGuest(userId)
      if (isGuest) {
        await this.guestCredentialsTransferrer.transferCredentials(userId)
      } else {
        await this.hostCredentialsTransferrer.transferCredentials(userId)
      }
    } catch {
      // It is safe to ignore the error. Transferring credentials is a
      // "best-case scenario" that will always succeed unless the user
      // is not a member of the GitHub organization or a guest user has
      // been incorrectly configured. Either way, we allow the user to
      // login an rely on the SessionBarrier to show an error later.
    }
  }
}
