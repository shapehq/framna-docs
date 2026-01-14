import { OpenAPIV3 } from "openapi-types"

interface CacheEntry {
  spec: OpenAPIV3.Document
  timestamp: number
}

export class SpecCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize: number
  private ttlMs: number

  constructor(maxSize = 50, ttlSeconds = 60) {
    this.maxSize = maxSize
    this.ttlMs = ttlSeconds * 1000
  }

  static createKey(projectName: string, ref: string, specName?: string): string {
    return `${projectName}:${ref}:${specName || "default"}`
  }

  get(key: string): OpenAPIV3.Document | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key)
      return null
    }

    // Move to end (MRU)
    this.cache.delete(key)
    this.cache.set(key, entry)
    return entry.spec
  }

  set(key: string, spec: OpenAPIV3.Document): void {
    // Evict LRU if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(key, { spec, timestamp: Date.now() })
  }
}
