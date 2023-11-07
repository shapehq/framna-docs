import ISession from "./ISession"
import ISessionValidator from "./ISessionValidator"

type SessionValidatorConfig = {
  readonly session: ISession
  readonly guestSessionValidator: ISessionValidator
  readonly hostSessionValidator: ISessionValidator
}

export default class SessionValidator implements ISessionValidator {
  private readonly session: ISession
  private readonly guestSessionValidator: ISessionValidator
  private readonly hostSessionValidator: ISessionValidator
  
  constructor(config: SessionValidatorConfig) {
    this.session = config.session
    this.guestSessionValidator = config.guestSessionValidator
    this.hostSessionValidator = config.hostSessionValidator
  }
  
  async validateSession(): Promise<boolean> {
    const isGuest = await this.session.getIsGuest()
    if (isGuest) {
      return await this.guestSessionValidator.validateSession()
    } else {
      return await this.hostSessionValidator.validateSession()
    }
  }
}