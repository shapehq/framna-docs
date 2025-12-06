import { IAzureDevOpsClient } from "@/common/azure-devops"
import IBlobProvider from "./IBlobProvider"

export default class AzureDevOpsBlobProvider implements IBlobProvider {
  private readonly client: IAzureDevOpsClient

  constructor(params: { client: IAzureDevOpsClient }) {
    this.client = params.client
  }

  // owner is ignored - Azure DevOps organization is configured globally
  async getFileContent(_owner: string, repository: string, path: string, ref: string): Promise<string | Blob | null> {
    const repositories = await this.client.getRepositories()
    const repo = repositories.find(r => r.name === repository)
    if (!repo) {
      return null
    }
    const content = await this.client.getFileContent(repo.id, path, ref)
    if (content === null) {
      return null
    }
    // Convert ArrayBuffer to Blob for binary content
    if (content instanceof ArrayBuffer) {
      return new Blob([content])
    }
    return content
  }
}
