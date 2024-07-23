import IKeyValueStore from "./IKeyValueStore"
import Redis from "ioredis"

export default class RedisKeyValueStore implements IKeyValueStore {
  private readonly url: string
  private _redis: Redis | undefined

  constructor(url: string) {
    this.url = url
  }
  
  async get(key: string): Promise<string | null> {
    return await this.redis.get(key)
  }
  
  async set(key: string, data: string | number | Buffer): Promise<void> {
    await this.redis.set(key, data)
  }
  
  async setExpiring(
    key: string,
    data: string | number | Buffer,
    timeToLive: number
  ): Promise<void> {
    await this.redis.setex(key, timeToLive, data)
  }
  
  async delete(key: string): Promise<void> {
    await this.redis.del(key)
  }
  
  private get redis(): Redis {
    if (this._redis) {
      return this._redis
    }
    const redis = new Redis(this.url)
    this._redis = redis
    return redis
  }
}
