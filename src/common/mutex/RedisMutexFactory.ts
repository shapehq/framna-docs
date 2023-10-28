import Redis from "ioredis"
import IMutexFactory from "./IMutexFactory"
import { Mutex } from "redis-semaphore"

class RedisMutex {
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
  
  async withMutex<T>(key: string, f: () => Promise<T>): Promise<T> {
    const mutex = new RedisMutex(this.redis, key)
    await mutex.acquire()
    try {
      const value = await f()
      await mutex.release()
      return value
    } catch(error) {
      await mutex.release()
      throw error
    }
  }
}
