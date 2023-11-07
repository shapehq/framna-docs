import { PostCommentPullRequestEventHandler } from "../../src/features/hooks/domain"

test("It adds a comment to the repository", async () => {
  let didAddComment = false
  const sut = new PostCommentPullRequestEventHandler({
    async getComments() {
      return []
    },
    async addComment() {
      didAddComment = true
    }
  }, "https://docs.shapetools.io")
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "shapehq",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didAddComment).toBeTruthy()
})

test("It adds a comment containing a link to the documentation", async () => {
  let commentBody: string | undefined
  const sut = new PostCommentPullRequestEventHandler({
    async getComments() {
      return []
    },
    async addComment(operation) {
      commentBody = operation.body
    }
  }, "https://docs.shapetools.io")
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "shapehq",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(commentBody).toContain("https://docs.shapetools.io/foo/bar")
})

test("It removes the \"openapi\" suffix of the repository name", async () => {
  let commentBody: string | undefined
  const sut = new PostCommentPullRequestEventHandler({
    async getComments() {
      return []
    },
    async addComment(operation) {
      commentBody = operation.body
    }
  }, "https://docs.shapetools.io")
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "shapehq",
    repositoryName: "foo-openapi",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(commentBody).toContain("https://docs.shapetools.io/foo/bar")
})
