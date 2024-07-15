export default interface IGitHubCommentFactory {
  makeDocumentationPreviewReadyComment({
    repositoryName,
    ref
  }: {
    repositoryName: string
    ref: string
  }): string
}
