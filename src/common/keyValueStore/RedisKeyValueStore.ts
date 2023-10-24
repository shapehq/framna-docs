import IKeyValueStore from "./IKeyValueStore"
import Redis from "ioredis"

export default class RedisKeyValueStore implements IKeyValueStore {
  private readonly redis: Redis

  constructor(url: string) {
    this.redis = new Redis(url)
  }
  
  async get(key: string): Promise<string | null> {
    return await this.redis.get(key)
  }
  
  async set(key: string, data: string | number | Buffer): Promise<void> {
    this.redis.set(key, data)
  }
  
  async delete(key: string): Promise<void> {
    this.redis.del(key)
  }
}
