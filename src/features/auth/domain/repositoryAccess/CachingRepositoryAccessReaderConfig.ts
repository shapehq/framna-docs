import { z } from "zod"
import ZodJSONCoder from "../../../../common/utils/ZodJSONCoder"
import IUserDataRepository from "@/common/userData/IUserDataRepository"

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
    /* eslint-disable-next-line no-empty */
    } catch (error: any) {
      console.error(error)
      return null
    }
  }
  
  private async refreshRepositoryNames(userId: string): Promise<string[]> {
    const repositoryNames = await this.repositoryAccessReader.getRepositoryNames(userId)
    try {
      const str = ZodJSONCoder.encode(RepositoryNamesContainerSchema, repositoryNames)
      await this.repository.set(userId, str)
    /* eslint-disable-next-line no-empty */
    } catch (error: any) {
      console.error(error)
    }
    return repositoryNames
  }
}
