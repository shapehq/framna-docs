export default class GitHubCommentFactory {
  static makeDocumentationPreviewReadyComment(link: string): string {
  return `### 📖 Documentation Preview
  
These edits are available for preview at [Shape Docs](${link}).
  
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
