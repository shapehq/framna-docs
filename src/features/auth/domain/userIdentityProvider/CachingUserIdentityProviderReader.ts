import IUserDataRepository from "@/common/userData/IUserDataRepository"
import IUserIdentityProviderReader from "./IUserIdentityProviderReader"
import UserIdentityProvider from "./UserIdentityProvider"

type Repository =  IUserDataRepository<string>

export default class CachingUserIdentityProviderReader implements IUserIdentityProviderReader {
  private readonly repository: Repository
  private readonly reader: IUserIdentityProviderReader
  
  constructor(repository: Repository, reader: IUserIdentityProviderReader) {
    this.repository = repository
    this.reader = reader
  }
  
  async getUserIdentityProvider(userId: string): Promise<UserIdentityProvider> {
    const cachedValue = await this.repository.get(userId)
    if (cachedValue) {
      return cachedValue as UserIdentityProvider
    } else {
      const userIdentity = await this.reader.getUserIdentityProvider(userId)
      await this.repository.set(userId, userIdentity.toString())
      return userIdentity
    }
  }
}
