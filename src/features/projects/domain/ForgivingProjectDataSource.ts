import Project from "./Project"
import IProjectDataSource from "./IProjectDataSource"

interface IAccessTokenReader {
  getAccessToken(): Promise<string>
}

type ForgivingProjectDataSourceConfig = {
  readonly accessTokenReader: IAccessTokenReader
  readonly projectDataSource: IProjectDataSource
}

export default class ForgivingProjectDataSource implements IProjectDataSource {
  private readonly accessTokenReader: IAccessTokenReader
  private readonly projectDataSource: IProjectDataSource
  
  constructor(config: ForgivingProjectDataSourceConfig) {
    this.accessTokenReader = config.accessTokenReader
    this.projectDataSource = config.projectDataSource
  }
  
  async getProjects(): Promise<Project[]> {
    try {
      await this.accessTokenReader.getAccessToken()
    } catch {
      // If we cannot get an access token for, we show an empty list
      // of projects. It is common for guest users that we cannot get
      // an access token because they have been incorrectly configured
      // to have access to non-existing repositories.
      return []
    }
    return this.projectDataSource.getProjects()
  }
}
