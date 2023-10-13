import { IVersionRepository } from "./IVersionRepository"
import { IGitHubClient } from "@/lib/github/IGitHubClient"
import { IGitHubProject } from "./IGitHubProject"
import { IGitHubVersion } from "./IGitHubVersion"

export class GitHubVersionRepository implements IVersionRepository {
  private gitHubClient: IGitHubClient
  
  constructor(gitHubClient: IGitHubClient) {
    this.gitHubClient = gitHubClient
  }

  async getVersions(project: IGitHubProject): Promise<IGitHubVersion[]> {
    const branchesPromise = this.gitHubClient.getBranches(project.owner, project.name)
    const tagsPromise = this.gitHubClient.getTags(project.owner, project.name)
    return Promise.all([branchesPromise, tagsPromise]).then(data => {
      const branches = data[0]
      const tags = data[1]
      const branchVersions = branches.map(b => {
        return { 
          owner: project.owner,
          repository: project.name,
          name: b.name
        }
      }).sort((a, b) => {
        return a.name.localeCompare(b.name)
      })
      let candidateDefaultBranches = ["main", "master", "develop", "development"]
      if (project.defaultBranch) {
        candidateDefaultBranches.splice(0, 0, project.defaultBranch)
      }
      // Reverse them so the top-priority branches end up at the top of the list.
      candidateDefaultBranches = candidateDefaultBranches.reverse()
      // Move the top-priority branches to the top of the list.
      for (const candidateDefaultBranch of candidateDefaultBranches) {
        const defaultBranchIndex = branchVersions.findIndex(e => e.name === candidateDefaultBranch)
        if (defaultBranchIndex !== -1) {
          const defaultBranchVersion = branchVersions[defaultBranchIndex]
          delete branchVersions[defaultBranchIndex]
          branchVersions.splice(0, 0, defaultBranchVersion)
        }
      }
      const tagVersions = tags.map(t => {
        return {
          owner: project.owner,
          repository: project.name,
          name: t.name
        }
      }).sort((a, b) => {
        return a.name.localeCompare(b.name)
      })
      return branchVersions.concat(tagVersions)
    })
  }
}