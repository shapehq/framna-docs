import { z } from "zod"
import { ZodJSONCoder, IUserDataRepository } from "../../../../common"

export const RepositoryNamesContainerSchema = z.string().array()

interface IRepositoryAccessReader {
  getRepositoryNames(userId: string): Promise<string[]>
}

type CachingRepositoryAccessReaderConfig = {
  readonly repository: IRepositoryNameRepository
  readonly repositoryAccessReader: IRepositoryAccessReader
}

type IRepositoryNameRepository = IUserDataRepository<string>

export default class CachingRepositoryAccessReader {
  private readonly repository: IRepositoryNameRepository
  private readonly repositoryAccessReader: IRepositoryAccessReader
  
  constructor(config: CachingRepositoryAccessReaderConfig) {
    this.repository = config.repository
    this.repositoryAccessReader = config.repositoryAccessReader
  }
  
  async getRepositoryNames(userId: string): Promise<string[]> {
    const cachedValue = await this.getCachedRepositoryNames(userId)
    if (cachedValue) {
      return cachedValue
    }
    return await this.refreshRepositoryNames(userId)
  }
  
  private async getCachedRepositoryNames(userId: string): Promise<string[] | null> {
    const str = await this.repository.get(userId)
    if (!str) {
      return null
    }
    try {
      return ZodJSONCoder.decode(RepositoryNamesContainerSchema, str)
    } catch (error: unknown) {
      console.error(error)
      return null
    }
  }
  
  private async refreshRepositoryNames(userId: string): Promise<string[]> {
    const repositoryNames = await this.repositoryAccessReader.getRepositoryNames(userId)
    try {
      const str = ZodJSONCoder.encode(RepositoryNamesContainerSchema, repositoryNames)
      await this.repository.set(userId, str)
    } catch (error: unknown) {
      console.error(error)
    }
    return repositoryNames
  }
}
