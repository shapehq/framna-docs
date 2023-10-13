import { IGitHubClient } from "@/lib/github/IGitHubClient"
import { IGitHubRepository } from "@/lib/github/IGitHubRepository"
import { IGitHubProject } from "./IGitHubProject"
import { INetworkClient } from "@/lib/networking/INetworkClient"
import { INetworkResponse } from "@/lib/networking/INetworkResponse"
import { IProjectRepository } from "./IProjectRepository"
import { ProjectConfigParser } from "./ProjectConfigParser"

export class GitHubProjectRepository implements IProjectRepository {
  private gitHubClient: IGitHubClient
  private networkClient: INetworkClient
  
  constructor(gitHubClient: IGitHubClient, networkClient: INetworkClient) {
    this.gitHubClient = gitHubClient
    this.networkClient = networkClient
  }
  
  async getProjects(): Promise<IGitHubProject[]> {
    const repositories = await this.gitHubClient.getRepositories("-openapi")
    const projects = await Promise.all(repositories.map(repository => { 
      return this.getProject(repository)
    }))
    return projects.sort((a, b) => a.name.localeCompare(b.name))
  }
  
  private async getProject(repository: IGitHubRepository): Promise<IGitHubProject> {
    const content = await this.gitHubClient.getContent(
      repository.owner, 
      repository.name, 
      repository.defaultBranch
    )
    const defaultName = repository.name.replace(/\-openapi$/, "")
    const configFile = content.find(e => this.isConfigFile(e.name))
    if (!configFile) {
      return {
        name: defaultName,
        repository: repository.name,
        owner: repository.owner,
        defaultBranch: repository.defaultBranch
      }
    }
    const configResponse: INetworkResponse<string> = await this.networkClient.get({
      url: configFile.url
    })
    const configParser = new ProjectConfigParser()
    const config = configParser.parse(configResponse.body)
    let imageURL: string | undefined = undefined
    if (config.image && config.image.length > 0) {
      imageURL = await this.getImageURL(repository, config.image)
    }
    return {
      name: config.name || defaultName,
      image: imageURL,
      repository: repository.name,
      owner: repository.owner,
      defaultBranch: repository.defaultBranch
    }
  }
  
  private async getImageURL(
    repository: IGitHubRepository,
    imagePath: string
  ): Promise<string | undefined> {
    const isValidURL = (string: string) => {
      try { 
        return Boolean(new URL(string))
      } catch(e) {
        return false
      }
    }
    if (isValidURL(imagePath)) {
      return imagePath
    }
    const items = await this.gitHubClient.getContent(
      repository.owner, 
      repository.name, 
      repository.defaultBranch,
      imagePath
    )
    return items.find(e => e.path == imagePath)?.url
  }

  private isConfigFile(filename: string): boolean {
    return ["yml", "yaml"].find(ext => filename === ".shape-docs." + ext) != null
  }
}
