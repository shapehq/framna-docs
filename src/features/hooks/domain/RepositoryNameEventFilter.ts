export default class RepositoryNameEventFilter {
  private readonly repositoryNameSuffix: string
  private readonly allowedRepositoryNames: string[]
  private readonly disallowedRepositoryNames: string[]
  
  constructor(config: {
    repositoryNameSuffix: string
    allowedRepositoryNames: string[]
    disallowedRepositoryNames: string[]
  }) {
    this.repositoryNameSuffix = config.repositoryNameSuffix
    this.allowedRepositoryNames = config.allowedRepositoryNames
    this.disallowedRepositoryNames = config.disallowedRepositoryNames
  }
  
  includeEvent(event: { repositoryName: string }) {
    if (!this.repositoryNameHasExpectedSuffix(event.repositoryName)) {
      return false
    }
    if (!this.isAllowedRepositoryName(event.repositoryName)) {
      return false
    }
    if (this.isDisallowedRepositoryName(event.repositoryName)) {
      return false
    }
    return true
  }
  
  private repositoryNameHasExpectedSuffix(repositoryName: string) {
    return repositoryName.endsWith(this.repositoryNameSuffix)
  }
  
  private isAllowedRepositoryName(repositoryName: string) {
    if (this.allowedRepositoryNames.length == 0) {
      return true
    }
    return this.allowedRepositoryNames.includes(repositoryName)
  }
  
  private isDisallowedRepositoryName(repositoryName: string) {
    return this.disallowedRepositoryNames.includes(repositoryName)
  }
}