import ExistingCommentCheckingPullRequestEventHandler from "../../src/features/hooks/domain/ExistingCommentCheckingPullRequestEventHandler"

test("It fetches comments from the repository", async () => {
  let didFetchComments = false
  const sut = new ExistingCommentCheckingPullRequestEventHandler({
    async pullRequestOpened(_event) {}
  }, {
    async getComments(_operation) {
      didFetchComments = true
      return []
    },
    async addComment(_operation) {}
  }, "https://docs.shapetools.io")
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "shapehq",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didFetchComments).toBeTruthy()
})

test("It does calls decorated event handler if a comment does not exist in the repository", async () => {
  let didCallEventHandler = false
  const sut = new ExistingCommentCheckingPullRequestEventHandler({
    async pullRequestOpened(_event) {
      didCallEventHandler = true
    }
  }, {
    async getComments(_operation) {
      return []
    },
    async addComment(_operation) {}
  }, "https://docs.shapetools.io")
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "shapehq",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeTruthy()
})

test("It does not call the event handler if a comment already exists in the repository", async () => {
  let didCallEventHandler = false
  const sut = new ExistingCommentCheckingPullRequestEventHandler({
    async pullRequestOpened(_event) {
      didCallEventHandler = true
    }
  }, {
    async getComments(_operation) {
      return [{
        body: "The documentation is available on https://docs.shapetools.io",
        isFromBot: true
      }]
    },
    async addComment(_operation) {}
  }, "https://docs.shapetools.io")
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "shapehq",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeFalsy()
})

test("It calls the event handler if a comment exists matching the needle domain but that comment is not from a bot", async () => {
  let didCallEventHandler = false
  const sut = new ExistingCommentCheckingPullRequestEventHandler({
    async pullRequestOpened(_event) {
      didCallEventHandler = true
    }
  }, {
    async getComments(_operation) {
      return [{
        body: "The documentation is available on https://docs.shapetools.io",
        isFromBot: false
      }]
    },
    async addComment(_operation) {}
  }, "https://docs.shapetools.io")
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "shapehq",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeTruthy()
})

test("It calls the event handler if the repository contains a comment from a bot but that comment does not contain the needle domain", async () => {
  let didCallEventHandler = false
  const sut = new ExistingCommentCheckingPullRequestEventHandler({
    async pullRequestOpened(_event) {
      didCallEventHandler = true
    }
  }, {
    async getComments(_operation) {
      return [{
        body: "Hello world!",
        isFromBot: true
      }]
    },
    async addComment(_operation) {}
  }, "https://docs.shapetools.io")
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "shapehq",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeTruthy()
})
