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
  
  constructor(config: {
    userIdReader: IUserIDReader,
    mutexFactory: IKeyedMutexFactory,
    baseKey: string
  }) {
    this.userIdReader = config.userIdReader
    this.baseKey = config.baseKey
    this.mutexFactory = config.mutexFactory
  }
  
  async makeMutex(): Promise<IMutex> {
    const userId = await this.userIdReader.getUserId()
    const key = `${this.baseKey}[${userId}]`
    return this.mutexFactory.makeMutex(key)
  }
}
