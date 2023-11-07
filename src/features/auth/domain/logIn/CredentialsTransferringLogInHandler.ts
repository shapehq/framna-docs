import ICredentialsTransferrer from "../credentialsTransfer/ICredentialsTransferrer"
import ILogInHandler from "./ILogInHandler"

export interface IRefreshTokenReader {
  getRefreshToken(userId: string): Promise<string>
}

export default class CredentialsTransferringLogInHandler implements ILogInHandler {
  private readonly credentialsTransferrer: ICredentialsTransferrer
  
  constructor(credentialsTransferrer: ICredentialsTransferrer) {
    this.credentialsTransferrer = credentialsTransferrer
  }
  
  async handleLogIn(userId: string): Promise<void> {
    await this.credentialsTransferrer.transferCredentials(userId)
  }
}
