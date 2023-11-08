import IKeyedMutexFactory from "./IKeyedMutexFactory"
import IMutex from "./IMutex"
import IMutexFactory from "./IMutexFactory"
import { ISession } from "@/common"

export default class SessionMutexFactory implements IMutexFactory {
  private readonly mutexFactory: IKeyedMutexFactory
  private readonly session: ISession
  private readonly baseKey: string
  
  constructor(
    mutexFactory: IKeyedMutexFactory,
    session: ISession,
    baseKey: string
  ) {
    this.session = session
    this.baseKey = baseKey
    this.mutexFactory = mutexFactory
  }
  
  async makeMutex(): Promise<IMutex> {
    const userId = await this.session.getUserId()
    const key = `${this.baseKey}[${userId}]`
    return this.mutexFactory.makeMutex(key)
  }
}
