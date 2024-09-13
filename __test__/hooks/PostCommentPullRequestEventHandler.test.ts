import { PostCommentPullRequestEventHandler } from "@/features/hooks/domain"

test("It comments when opening a pull request", async () => {
  let didComment = false
  const sut = new PostCommentPullRequestEventHandler({
    pullRequestCommenter: {
      async commentPullRequest(_request) {
        didComment = true
      }
    }
  })
  await sut.pullRequestOpened({
    hostURL: "https://localhost:3000",
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryOwner: "acme",
    repositoryName: "demo-openapi",
    ref: "main"
  })
  expect(didComment).toBeTruthy()
})

test("It comments when reopening a pull request", async () => {
  let didComment = false
  const sut = new PostCommentPullRequestEventHandler({
    pullRequestCommenter: {
      async commentPullRequest(_request) {
        didComment = true
      }
    }
  })
  await sut.pullRequestReopened({
    hostURL: "https://localhost:3000",
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryOwner: "acme",
    repositoryName: "demo-openapi",
    ref: "main"
  })
  expect(didComment).toBeTruthy()
})

test("It comments when synchronizing a pull request", async () => {
  let didComment = false
  const sut = new PostCommentPullRequestEventHandler({
    pullRequestCommenter: {
      async commentPullRequest(_request) {
        didComment = true
      }
    }
  })
  await sut.pullRequestSynchronized({
    hostURL: "https://localhost:3000",
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryOwner: "acme",
    repositoryName: "demo-openapi",
    ref: "main"
  })
  expect(didComment).toBeTruthy()
})
