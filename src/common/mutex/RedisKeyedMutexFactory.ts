import Redis from "ioredis"
import IMutex from "./IMutex"
import IKeyedMutexFactory from "./IKeyedMutexFactory"
import { Mutex } from "redis-semaphore"

class RedisMutex implements IMutex {
  private readonly mutex: Mutex
  
  constructor(redis: Redis, key: string) {
    this.mutex = new Mutex(redis, key)
  }
  
  async acquire(): Promise<void> {
    return await this.mutex.acquire()
  }
  
  async release(): Promise<void> {
    return await this.mutex.release()
  }
}

export default class RedisKeyedMutexFactory implements IKeyedMutexFactory {
  private readonly url: string
  private _redis: Redis | undefined
  
  constructor(url: string) {
    this.url = url
  }
  
  makeMutex(key: string): IMutex {
    return new RedisMutex(this.redis, key)
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
