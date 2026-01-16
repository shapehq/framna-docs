import ProjectSummary from "./ProjectSummary"
import IProjectListDataSource from "./IProjectListDataSource"
import IProjectListRepository from "./IProjectListRepository"

export default class CachingProjectListDataSource implements IProjectListDataSource {
  private dataSource: IProjectListDataSource
  private repository: IProjectListRepository

  constructor(config: {
    dataSource: IProjectListDataSource
    repository: IProjectListRepository
  }) {
    this.dataSource = config.dataSource
    this.repository = config.repository
  }

  async getProjectList(): Promise<ProjectSummary[]> {
    const cache = await this.repository.get()
    if (cache && cache.length > 0) {
      // Return cached data immediately, refresh in background
      this.refreshInBackground()
      return cache
    }
    // No cache, fetch and store
    const projects = await this.dataSource.getProjectList()
    await this.repository.set(projects)
    return projects
  }

  private async refreshInBackground(): Promise<void> {
    try {
      const projects = await this.dataSource.getProjectList()
      await this.repository.set(projects)
    } catch (err) {
      console.warn("[CachingProjectListDataSource] Background refresh failed:", err)
    }
  }
}
