import { ILogInHandler, IAccount } from "."

export default class NullObjectLogInHandler implements ILogInHandler {
  constructor() {}
  
  async handleLogIn(_userId: string, _account?: IAccount): Promise<boolean> {
    return true
  }
}
