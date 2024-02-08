import IKeyedMutexFactory from "./IKeyedMutexFactory"
import IMutex from "./IMutex"
import IMutexFactory from "./IMutexFactory"

interface IUserIDReader {
  getUserId(): Promise<string>
}

export default class SessionMutexFactory implements IMutexFactory {
  private readonly mutexFactory: IKeyedMutexFactory
  private readonly userIdReader: IUserIDReader
  private readonly baseKey: string
  
  constructor(
    mutexFactory: IKeyedMutexFactory,
    userIdReader: IUserIDReader,
    baseKey: string
  ) {
    this.userIdReader = userIdReader
    this.baseKey = baseKey
    this.mutexFactory = mutexFactory
  }
  
  async makeMutex(): Promise<IMutex> {
    const userId = await this.userIdReader.getUserId()
    const key = `${this.baseKey}[${userId}]`
    return this.mutexFactory.makeMutex(key)
  }
}
