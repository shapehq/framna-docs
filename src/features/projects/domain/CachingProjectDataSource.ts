import Project from "./Project"
import IProjectDataSource from "./IProjectDataSource"
import IProjectRepository from "./IProjectRepository"

export default class CachingProjectDataSource implements IProjectDataSource {
  private dataSource: IProjectDataSource
  private repository: IProjectRepository
  
  constructor(config: { dataSource: IProjectDataSource, repository: IProjectRepository }) {
    this.dataSource = config.dataSource
    this.repository = config.repository
  }
  
  async getProjects(): Promise<Project[]> {
    const cachedProjects = await this.repository.get()
    console.log("Cached projects:", cachedProjects)  
    if (cachedProjects) {
      return cachedProjects
    }
    const projects = await this.dataSource.getProjects()
    await this.repository.set(projects)
    return projects
  }
}