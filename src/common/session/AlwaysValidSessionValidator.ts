import ISessionValidator from "./ISessionValidator"

export default class AlwaysValidSessionValidator implements ISessionValidator {
  async validateSession(): Promise<boolean> {
    return true
  }
}