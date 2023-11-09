import { IUserDataRepository, ZodJSONCoder } from "../../../common"
import IProjectRepository from "./IProjectRepository"
import Project, { ProjectSchema } from "./Project"

interface IUserIDReader {
  getUserId(): Promise<string>
}

type Repository = IUserDataRepository<string>

export default class ProjectRepository implements IProjectRepository {
  private readonly userIDReader: IUserIDReader
  private readonly repository: Repository
  
  constructor(userIDReader: IUserIDReader, repository: Repository) {
    this.userIDReader = userIDReader
    this.repository = repository
  }
  
  async get(): Promise<Project[] | undefined> {
    const userId = await this.userIDReader.getUserId()
    const string = await this.repository.get(userId)
    if (!string) {
      return undefined
    }
    return ZodJSONCoder.decode(ProjectSchema.array(), string)
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
