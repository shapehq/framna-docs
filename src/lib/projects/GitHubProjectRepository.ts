import { IGitHubProject } from "./IGitHubProject"
import { IProjectRepository } from "./IProjectRepository"
import { IGitHubClient } from "@/lib/github/IGitHubClient"

export class GitHubProjectRepository implements IProjectRepository {
  private gitHubClient: IGitHubClient
  
  constructor(gitHubClient: IGitHubClient) {
    this.gitHubClient = gitHubClient
  }
  
  async getProjects(): Promise<IGitHubProject[]> {
    return await this.gitHubClient.getRepositories("-openapi")
  }
}
