type EnvMethods = {
  get(key: string): string | undefined,
  getOrThrow(key: string): string
}

type EnvObject = EnvMethods & {
  [key: string]: string | undefined
}

const base: EnvMethods = {
  get(key: string): string | undefined {
    return process.env[key]
  },
  getOrThrow(key: string): string {
    const value = process.env[key]
    if (!value || value.length === 0) {
      throw new Error(`Environment variable "${key}" is not set`)
    }
    console.log(`${key}=${value}`)
    return value
  }
}

const env = new Proxy(base, {
  get(target, prop: string) {
    if (prop in target) {
      return (target as any)[prop]
    }
    return target.get(prop)
  }
}) as EnvObject

export default env
