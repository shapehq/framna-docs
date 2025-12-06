import { IGitHubClient } from "@/common/github"
import IBlobProvider from "./IBlobProvider"

export default class GitHubBlobProvider implements IBlobProvider {
  private readonly gitHubClient: IGitHubClient

  constructor(params: { gitHubClient: IGitHubClient }) {
    this.gitHubClient = params.gitHubClient
  }

  async getFileContent(owner: string, repository: string, path: string, ref: string): Promise<Blob | null> {
    try {
      const item = await this.gitHubClient.getRepositoryContent({
        repositoryOwner: owner,
        repositoryName: repository,
        path,
        ref
      })
      return await fetch(new URL(item.downloadURL)).then(r => r.blob())
    } catch {
      return null
    }
  }
}
