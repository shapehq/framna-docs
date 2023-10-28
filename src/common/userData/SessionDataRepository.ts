import ISession from "../session/ISession"
import ISessionDataRepository from "@/common/userData/ISessionDataRepository"
import IUserDataRepository from "@/common/userData/IUserDataRepository"

export default class SessionDataRepository<T> implements ISessionDataRepository<T> {
  private readonly session: ISession
  private readonly repository: IUserDataRepository<T>
  
  constructor(session: ISession, repository: IUserDataRepository<T>) {
    this.session = session
    this.repository = repository
  }
  
  async get(): Promise<T | null> {
    const userId = await this.session.getUserId()
    return await this.repository.get(userId)
  }
  
  async set(value: T): Promise<void> {
    const userId = await this.session.getUserId()
    return await this.repository.set(userId, value)
  }
  
  async delete(): Promise<void> {
    const userId = await this.session.getUserId()
    return await this.repository.delete(userId)
  }
}
