import ILogOutHandler from "./ILogOutHandler"

interface IUserIDReader {
  getUserId(): Promise<string>
}

interface Repository {
  delete(userId: string): Promise<void>
}

export default class UserDataCleanUpLogOutHandler implements ILogOutHandler {
  private readonly userIdReader: IUserIDReader
  private readonly repository: Repository
  
  constructor(userIdReader: IUserIDReader, repository: Repository) {
    this.userIdReader = userIdReader
    this.repository = repository
  }
  
  async handleLogOut(): Promise<void> {
    const userId = await this.userIdReader.getUserId()
    return await this.repository.delete(userId)
  }
}
