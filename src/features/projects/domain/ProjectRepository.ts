import { IUserDataRepository, ZodJSONCoder } from "@/common"
import IProjectRepository from "./IProjectRepository"
import Project, { ProjectSchema } from "./Project"

interface IUserIDReader {
  getUserId(): Promise<string>
}

export default class ProjectRepository implements IProjectRepository {
  private readonly userIDReader: IUserIDReader
  private readonly repository: IUserDataRepository<string>
  
  constructor(config: { userIDReader: IUserIDReader, repository: IUserDataRepository<string> }) {
    this.userIDReader = config.userIDReader
    this.repository = config.repository
  }
  
    async get(): Promise<Project[] | undefined> {
    const userId = await this.userIDReader.getUserId()
    const string = await this.repository.get(userId)
   
    if (!string) {
      return undefined
    }
    try {
      return ZodJSONCoder.decode(ProjectSchema.array(), string)
    } catch { // swallow decode errors and treat as missing cache
      console.warn("[ProjectRepository] Failed to decode cached projects – treating as cache miss")
      return undefined
    }
  }
  
  async set(projects: Project[]): Promise<void> {
    const userId = await this.userIDReader.getUserId()
    const string = ZodJSONCoder.encode(ProjectSchema.array(), projects)
    await this.repository.setExpiring(userId, string, 30 * 24 * 3600)
  }
  
  async delete(): Promise<void> {
    const userId = await this.userIDReader.getUserId()
    await this.repository.delete(userId)
  }
}
