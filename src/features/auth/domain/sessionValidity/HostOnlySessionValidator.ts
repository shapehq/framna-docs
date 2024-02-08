import SessionValidity from "./SessionValidity"

interface IIsGuestReader {
  getIsGuest(): Promise<boolean>
}

interface ISessionValidator {
  validateSession(): Promise<SessionValidity>
}

export default class HostOnlySessionValidator {
  private readonly isGuestReader: IIsGuestReader
  private readonly sessionValidator: ISessionValidator
  
  constructor(
    config: {
      isGuestReader: IIsGuestReader
      sessionValidator: ISessionValidator
    }
  ) {
    this.isGuestReader = config.isGuestReader
    this.sessionValidator = config.sessionValidator
  }
  
  async validateSession(): Promise<SessionValidity> {
    const isGuest = await this.isGuestReader.getIsGuest()
    if (!isGuest) {
      return await this.sessionValidator.validateSession()
    } else {
      return SessionValidity.VALID
    }
  }
}
