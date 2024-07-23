import ILogOutHandler from "./ILogOutHandler"

export default class CompositeLogOutHandler implements ILogOutHandler {
  private readonly handlers: ILogOutHandler[]
  
  constructor(handlers: ILogOutHandler[]) {
    this.handlers = handlers
  }
  
  async handleLogOut(): Promise<void> {
    const promises = this.handlers.map(e => e.handleLogOut())
    await Promise.all(promises)
  }
}
