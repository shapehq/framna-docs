import { ZodJSONCoder, ISession, IUserDataRepository } from "../../../common"
import IProjectRepository from "./IProjectRepository"
import Project, { ProjectSchema } from "./Project"

type Repository = IUserDataRepository<string>

export default class ProjectRepository implements IProjectRepository {
  private readonly session: ISession
  private readonly repository: Repository
  
  constructor(session: ISession, repository: Repository) {
    this.session = session
    this.repository = repository
  }
  
  async get(): Promise<Project[] | undefined> {
    const userId = await this.session.getUserId()
    const string = await this.repository.get(userId)
    if (!string) {
      return undefined
    }
    return ZodJSONCoder.decode(ProjectSchema.array(), string)
  }
  
  async set(projects: Project[]): Promise<void> {
    const userId = await this.session.getUserId()
    const string = ZodJSONCoder.encode(ProjectSchema.array(), projects)
    await this.repository.set(userId, string)
  }
  
  async delete(): Promise<void> {
    const userId = await this.session.getUserId()
    await this.repository.delete(userId)
  }
}
