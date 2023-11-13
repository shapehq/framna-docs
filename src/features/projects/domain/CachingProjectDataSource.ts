import Project from "./Project"
import IProjectDataSource from "./IProjectDataSource"
import IProjectRepository from "./IProjectRepository"

type CachingProjectDataSourceConfig = {
  readonly dataSource: IProjectDataSource
  readonly repository: IProjectRepository
}

export default class CachingProjectDataSource implements IProjectDataSource {
  private dataSource: IProjectDataSource
  private repository: IProjectRepository
  
  constructor(config: CachingProjectDataSourceConfig) {
    this.dataSource = config.dataSource
    this.repository = config.repository
  }
  
  async getProjects(): Promise<Project[]> {
    const projects = await this.dataSource.getProjects()
    await this.repository.set(projects)
    return projects
  }
}