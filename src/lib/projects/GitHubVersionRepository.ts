import { IVersion } from "./IVersion"
import { IVersionRepository } from "./IVersionRepository"
import { IGitHubClient } from "@/lib/github/IGitHubClient"
import { IGitHubProject } from "./IGitHubProject"

export class GitHubVersionRepository implements IVersionRepository {
  private gitHubClient: IGitHubClient
  
  constructor(gitHubClient: IGitHubClient) {
    this.gitHubClient = gitHubClient
  }

  async getVersions(project: IGitHubProject): Promise<IVersion[]> {
    const branchesPromise = this.gitHubClient.getBranches(project.owner, project.name)
    const tagsPromise = this.gitHubClient.getTags(project.owner, project.name)
    return Promise.all([branchesPromise, tagsPromise]).then(data => {
      const branches = data[0]
      const tags = data[1]
      const branchVersions = branches.map(b => {
        return { name: b.name }
      })
      const tagVersions = tags.map(t => {
        return { name: t.name }
      })
      return tagVersions.concat(branchVersions).sort((a, b) => {
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      })
    })
  }
}