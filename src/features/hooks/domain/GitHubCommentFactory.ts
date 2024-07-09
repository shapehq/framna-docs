import IGitHubCommentFactory from "./IGitHubCommentFactory"

export default class GitHubCommentFactory implements IGitHubCommentFactory {
  private readonly websiteTitle: string
  private readonly domain: string
  
  constructor(config: { websiteTitle: string, domain: string }) {
    this.websiteTitle = config.websiteTitle
    this.domain = config.domain
  }
  
  makeDocumentationPreviewReadyComment({
    repositoryName,
    ref
  }: {
    repositoryName: string
    ref: string
  }): string {
    const projectId = repositoryName.replace(/-openapi$/, "")
    const link = `${this.domain}/${projectId}/${ref}`
    return `### 📖 Documentation Preview
      
    These edits are available for preview at [${this.websiteTitle}](${link}).
      
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
