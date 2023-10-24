import { getSession } from "@auth0/nextjs-auth0"
import ISessionDataRepository from "@/common/userData/ISessionDataRepository"
import IUserDataRepository from "@/common/userData/IUserDataRepository"
import { UnauthorizedError } from "@/features/auth/domain/AuthError"

export default class Auth0SessionDataRepository<T> implements ISessionDataRepository<T> {
  private readonly repository: IUserDataRepository<T>
  
  constructor(repository: IUserDataRepository<T>) {
    this.repository = repository
  }
  
  async get(): Promise<T | null> {
    const session = await getSession()
    if (!session) {
      throw new UnauthorizedError(`User data could not be read because the user is not authenticated.`)
    }
    return await this.repository.get(session.user.sub)
  }
  
  async set(value: T): Promise<void> {
    const session = await getSession()
    if (!session) {
      throw new UnauthorizedError(`User data could not be persisted because the user is not authenticated.`)
    }
    return await this.repository.set(session.user.sub, value)
  }
  
  async delete(): Promise<void> {
    const session = await getSession()
    if (!session) {
      throw new UnauthorizedError(`User data could not be deleted because the user is not authenticated.`)
    }
    return await this.repository.delete(session.user.sub)
  }
}
