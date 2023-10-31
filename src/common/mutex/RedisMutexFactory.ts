import Redis from "ioredis"
import IMutex from "./IMutex"
import IMutexFactory from "./IMutexFactory"
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

export default class RedisMutexFactory implements IMutexFactory {
  private readonly redis: Redis
  
  constructor(url: string) {
    this.redis = new Redis(url)
  }
  
  makeMutex(key: string): IMutex {
    return new RedisMutex(this.redis, key)
  }
}
