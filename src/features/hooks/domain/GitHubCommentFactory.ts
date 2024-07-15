import IGitHubCommentFactory from "./IGitHubCommentFactory"

export default class GitHubCommentFactory implements IGitHubCommentFactory {
  private readonly repositoryNameSuffix: string
  private readonly siteName: string
  private readonly domain: string
  
  constructor(config: {
    repositoryNameSuffix: string
    siteName: string
    domain: string
  }) {
    this.repositoryNameSuffix = config.repositoryNameSuffix
    this.siteName = config.siteName
    this.domain = config.domain
  }
  
  makeDocumentationPreviewReadyComment({
    repositoryName,
    ref
  }: {
    repositoryName: string
    ref: string
  }): string {
    const projectId = repositoryName.replace(new RegExp(this.repositoryNameSuffix + "$"), "")
    const link = `${this.domain}/${projectId}/${ref}`
    return `### 📖 Documentation Preview
      
    These edits are available for preview at [${this.siteName}](${link}).
      
    <table>
      <tr>
        <td><strong>Status:</strong></td><td>✅ Ready!</td>
      </tr>
      <tr>
        <td><strong>Preview URL:</strong></td><td><a href="${link}">${link}</a></td>
      </tr>
    </table>`
  }
}
