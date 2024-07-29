import IGitHubRepositoryDataSource, {
  GitHubRepository
} from "./IGitHubRepositoryDataSource"
import { splitOwnerAndRepository } from "@/common"

export default class FilteringGitHubRepositoryDataSource implements IGitHubRepositoryDataSource {
  private readonly dataSource: IGitHubRepositoryDataSource
  private readonly rawHiddenRepositories: string[]
  
  constructor(config: {
    dataSource: IGitHubRepositoryDataSource,
    hiddenRepositories: string[]
  }) {
    this.dataSource = config.dataSource
    this.rawHiddenRepositories = config.hiddenRepositories
  }
  
  async getRepositories(): Promise<GitHubRepository[]> {
    const repositories = await this.dataSource.getRepositories()
    const hiddenRepositories = this.rawHiddenRepositories
      .map(splitOwnerAndRepository)
      .filter(e => e !== undefined)
    return repositories.filter(repository => {
      const hiddenMatch = hiddenRepositories.find(e => 
        e.owner == repository.owner && e.repository == repository.name
      )
      return hiddenMatch === undefined
    })
  }
}