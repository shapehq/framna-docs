import { PostCommentPullRequestEventHandler } from "../../src/features/hooks/domain"

test("It adds a comment to the repository", async () => {
  let didAddComment = false
  const sut = new PostCommentPullRequestEventHandler({
    commentRepository: {
      async getComments() {
        return []
      },
      async addComment() {
        didAddComment = true
      }
    },
    commentFactory: {
      makeDocumentationPreviewReadyComment() {
        return "This is the comment"
      }
    }
  })
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "acme",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didAddComment).toBeTruthy()
})
