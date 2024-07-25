import IGitHubRepositoryDataSource, {
  GitHubRepository
} from "./IGitHubRepositoryDataSource"

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
    // Split full repository names into owner and repository.
    // shapehq/foo becomes { owner: "shapehq", "repository": "foo" }
    const hiddenOwnerAndRepoNameList = this.hiddenRepositories.map(str => {
      const index = str.indexOf("/")
      if (index === -1) {
        return { owner: str, repository: "" }
      }
      const owner = str.substring(0, index)
      const repository = str.substring(index + 1) 
      return { owner, repository }
    })
    // Only return repositories that are not on the hidden list.
    return repositories.filter(repository => {
      const hiddenMatch = hiddenOwnerAndRepoNameList.find(e => 
        e.owner == repository.owner.login && e.repository == repository.name
      )
      return hiddenMatch === undefined
    })
  }
}