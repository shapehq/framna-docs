import Project from "./Project"
import IProjectDataSource from "./IProjectDataSource"
import IProjectRepository from "./IProjectRepository"

export default class CachingProjectDataSource implements IProjectDataSource {
  private dataSource: IProjectDataSource
  private repository: IProjectRepository
  
  constructor(
    dataSource: IProjectDataSource,
    repository: IProjectRepository
  ) {
    this.dataSource = dataSource
    this.repository = repository
  }
  
  async getProjects(): Promise<Project[]> {
    const projects = await this.dataSource.getProjects()
    await this.repository.set(projects)
    return projects
  }
}