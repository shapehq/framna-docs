import Project from "./Project"
import IProjectDataSource from "./IProjectDataSource"
import ISessionProjectRepository from "./ISessionProjectRepository"

export default class CachingProjectDataSource implements IProjectDataSource {
  private dataSource: IProjectDataSource
  private sessionProjectRepository: ISessionProjectRepository
  
  constructor(
    dataSource: IProjectDataSource,
    sessionProjectRepository: ISessionProjectRepository
  ) {
    this.dataSource = dataSource
    this.sessionProjectRepository = sessionProjectRepository
  }
  
  async getProjects(): Promise<Project[]> {
    const projects = await this.dataSource.getProjects()
    await this.sessionProjectRepository.storeProjects(projects)
    return projects
  }
}