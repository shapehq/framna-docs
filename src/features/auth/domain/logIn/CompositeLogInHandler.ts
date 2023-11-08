import ILogInHandler from "./ILogInHandler"

export default class CompositeLogInHandler implements ILogInHandler {
  private readonly handlers: ILogInHandler[]
  
  constructor(handlers: ILogInHandler[]) {
    this.handlers = handlers
  }
  
  async handleLogIn(userId: string): Promise<void> {
    const promises = this.handlers.map(e => e.handleLogIn(userId))
    await Promise.all(promises)
  }
}
