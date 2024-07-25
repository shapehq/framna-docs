import IGitHubRepositoryDataSource, {
  GitHubRepository
} from "./IGitHubRepositoryDataSource"
import { splitOwnerAndRepository } from "@/common"

export default class FilteringGitHubRepositoryDataSource implements IGitHubRepositoryDataSource {
  private readonly dataSource: IGitHubRepositoryDataSource
  private readonly hiddenRepositories: string[]
  
  constructor(config: {
    dataSource: IGitHubRepositoryDataSource,
    hiddenRepositories: string[]
  }) {
    this.dataSource = config.dataSource
    this.hiddenRepositories = config.hiddenRepositories
  }
  
  async getRepositories(): Promise<GitHubRepository[]> {
    const repositories = await this.dataSource.getRepositories()
    const hiddenOwnerAndRepoNameList = this.hiddenRepositories
      .map(splitOwnerAndRepository)
      .filter(e => e !== undefined)
    return repositories.filter(repository => {
      const hiddenMatch = hiddenOwnerAndRepoNameList.find(e => 
        e.owner == repository.owner && e.repository == repository.name
      )
      return hiddenMatch === undefined
    })
  }
}