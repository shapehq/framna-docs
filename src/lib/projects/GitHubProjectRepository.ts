import { AccessTokenProviding } from "@/lib/auth/AccessTokenProviding" 
import { Project } from "./Project"
import { ProjectRepository } from "./ProjectRepository"
import { Octokit } from "octokit"

export class GitHubProjectRepository implements ProjectRepository {
  private accessTokenStore: AccessTokenProviding
  
  constructor(accessTokenStore: AccessTokenProviding) {
    this.accessTokenStore = accessTokenStore
  }
  
  async getProjects(): Promise<Project[]> {
    const accessToken = await this.accessTokenStore.getAccessToken()
    const octokit = new Octokit({ auth: accessToken })
    let projects: Project[] = []
    for await (const response of octokit.paginate.iterator(
      octokit.rest.repos.listForAuthenticatedUser
    )) {
      projects = projects.concat(response.data.map(e => {
        return {
          name: e.name
        } 
      }))
    }
    return projects
  }
}
