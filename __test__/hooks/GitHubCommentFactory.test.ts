import { GitHubCommentFactory } from "../../src/features/hooks/domain"

test("It includes a link to the documentation", async () => {
  const sut = new GitHubCommentFactory({
    websiteTitle: "Demo Docs",
    domain: "https://example.com"
  })
  const text = sut.makeDocumentationPreviewReadyComment({
    repositoryName: "foo",
    ref: "bar"
  })
  expect(text).toContain("https://example.com/foo/bar")
})

test("It removes the \"openapi\" suffix of the repository name", async () => {
  const sut = new GitHubCommentFactory({
    websiteTitle: "Demo Docs",
    domain: "https://example.com"
  })
  const text = sut.makeDocumentationPreviewReadyComment({
    repositoryName: "foo-openapi",
    ref: "bar"
  })
  expect(text).toContain("https://example.com/foo/bar")
})