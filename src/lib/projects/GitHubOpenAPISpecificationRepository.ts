import { IOpenAPISpecification } from "./IOpenAPISpecification"
import { IOpenAPISpecificationRepository } from "./IOpenAPISpecificationRepository"
import { IGitHubClient } from "@/lib/github/IGitHubClient"
import { IGitHubVersion } from "./IGitHubVersion"

export class GitHubOpenAPISpecificationRepository implements IOpenAPISpecificationRepository {
  private gitHubClient: IGitHubClient
  
  constructor(gitHubClient: IGitHubClient) {
    this.gitHubClient = gitHubClient
  }
  
  async getOpenAPISpecifications(version: IGitHubVersion): Promise<IOpenAPISpecification[]> {
    const content = await this.gitHubClient.getContent(version.owner, version.repository)
    return content.filter(e => {
      return this.isOpenAPISpecification(e.name)
    })
  }
  
  private isOpenAPISpecification(filename: string): boolean {
    return !filename.startsWith(".") && (
      filename.endsWith(".yml") || filename.endsWith(".yaml")
    )
  }
}
