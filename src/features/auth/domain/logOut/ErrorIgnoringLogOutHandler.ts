import ILogOutHandler from "./ILogOutHandler"

export default class ErrorIgnoringLogOutHandler implements ILogOutHandler {
  private readonly handler: ILogOutHandler
  
  constructor(handler: ILogOutHandler) {
    this.handler = handler
  }
  
  async handleLogOut(): Promise<void> {
    try {
      await this.handler.handleLogOut()
    } catch {
      // We intentionally do not handle errors.
    }
  }
}
