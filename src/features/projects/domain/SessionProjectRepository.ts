import ZodJSONCoder from "@/common/utils/ZodJSONCoder"
import ISessionDataRepository from "@/common/userData/ISessionDataRepository"
import Project, { ProjectSchema } from "./Project"

export default class SessionProjectRepository {
  private readonly repository: ISessionDataRepository<string>
  
  constructor(repository: ISessionDataRepository<string>) {
    this.repository = repository
  }
  
  async getProjects(): Promise<Project[] | undefined> {
    const string = await this.repository.get()
    if (!string) {
      return undefined
    }
    return ZodJSONCoder.decode(ProjectSchema.array(), string)
  }
  
  async storeProjects(projects: Project[]): Promise<void> {
    const string = ZodJSONCoder.encode(ProjectSchema.array(), projects)
    await this.repository.set(string)
  }
  
  async deleteProjects(): Promise<void> {
    await this.repository.delete()
  }
}
