import ISessionValidator from "./ISessionValidator"

interface IIsGuestReader {
  getIsGuest(): Promise<boolean>
}

type SessionValidatorConfig = {
  readonly isGuestReader: IIsGuestReader
  readonly guestSessionValidator: ISessionValidator
  readonly hostSessionValidator: ISessionValidator
}

export default class SessionValidator implements ISessionValidator {
  private readonly isGuestReader: IIsGuestReader
  private readonly guestSessionValidator: ISessionValidator
  private readonly hostSessionValidator: ISessionValidator
  
  constructor(config: SessionValidatorConfig) {
    this.isGuestReader = config.isGuestReader
    this.guestSessionValidator = config.guestSessionValidator
    this.hostSessionValidator = config.hostSessionValidator
  }
  
  async validateSession(): Promise<boolean> {
    const isGuest = await this.isGuestReader.getIsGuest()
    if (isGuest) {
      return await this.guestSessionValidator.validateSession()
    } else {
      return await this.hostSessionValidator.validateSession()
    }
  }
}