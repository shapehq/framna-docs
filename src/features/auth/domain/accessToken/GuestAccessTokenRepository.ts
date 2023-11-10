export interface IRepository {
  get(userId: string): Promise<string | null>
  setExpiring(userId: string, token: string, timeToLive: number): Promise<void>
  delete(userId: string): Promise<void>
}

export default class GuestAccessTokenRepository {
  private readonly repository: IRepository
  
  constructor(repository: IRepository) {
    this.repository = repository
  }
  
  async get(userId: string): Promise<string | null> {
    return await this.repository.get(userId)
  }
  
  async set(userId: string, accessToken: string): Promise<void> {
    await this.repository.setExpiring(userId, accessToken, 7 * 24 * 3600)
  }
  
  async delete(userId: string): Promise<void> {
    await this.repository.delete(userId)
  }
}