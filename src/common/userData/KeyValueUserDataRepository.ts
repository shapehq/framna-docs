import IKeyValueStore from "../keyValueStore/IKeyValueStore"
import IUserDataRepository from "./IUserDataRepository"

export default class KeyValueUserDataRepository implements IUserDataRepository<string> {
  private readonly store: IKeyValueStore
  private readonly baseKey: string
  
  constructor(store: IKeyValueStore, baseKey: string) {
    this.store = store
    this.baseKey = baseKey
  }
  
  async get(userId: string): Promise<string | null> {
    return await this.store.get(this.getKey(userId))
  }
  
  async set(userId: string, value: string): Promise<void> {
    await this.store.set(this.getKey(userId), value)
  }
  
  async setExpiring(userId: string, value: string, timeToLive: number): Promise<void> {
    await this.store.setExpiring(this.getKey(userId), value, timeToLive)
  }
  
  async delete(userId: string): Promise<void> {
    await this.store.delete(this.getKey(userId))
  }
  
  private getKey(userId: string): string {
    return `${this.baseKey}[${userId}]`
  }
}
