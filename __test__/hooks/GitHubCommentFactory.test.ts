import { GitHubCommentFactory } from "../../src/features/hooks/domain"

test("It includes a link to the documentation", async () => {
  const text = GitHubCommentFactory.makeDocumentationPreviewReadyComment(
    "https://docs.shapetools.io/foo/bar"
  )
  expect(text).toContain("https://docs.shapetools.io/foo/bar")
})