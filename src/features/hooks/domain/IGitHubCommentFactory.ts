export default interface IGitHubCommentFactory {
  makeDocumentationPreviewReadyComment(request: {
    owner: string
    repositoryName: string
    ref: string
  }): string
}
