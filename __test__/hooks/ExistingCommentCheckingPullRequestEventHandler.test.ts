import { ExistingCommentCheckingPullRequestEventHandler } from "../../src/features/hooks/domain"

test("It fetches comments from the repository", async () => {
  let didFetchComments = false
  const sut = new ExistingCommentCheckingPullRequestEventHandler({
    eventHandler: {
      async pullRequestOpened() {}
    },
    commentRepository: {
      async getComments() {
        didFetchComments = true
        return []
      },
      async addComment() {}
    },
    gitHubAppId: "appid1234"
  })
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "acme",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didFetchComments).toBeTruthy()
})

test("It calls decorated event handler if a comment does not exist in the repository", async () => {
  let didCallEventHandler = false
  const sut = new ExistingCommentCheckingPullRequestEventHandler({
    eventHandler: {
      async pullRequestOpened() {
        didCallEventHandler = true
      }
    },
    commentRepository: {
      async getComments() {
        return []
      },
      async addComment() {}
    },
    gitHubAppId: "appid1234"
  })
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "acme",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeTruthy()
})

test("It does not call the event handler if a comment already exists in the repository", async () => {
  let didCallEventHandler = false
  const sut = new ExistingCommentCheckingPullRequestEventHandler({
    eventHandler: {
      async pullRequestOpened() {
        didCallEventHandler = true
      }
    },
    commentRepository: {
      async getComments() {
        return [{
          isFromBot: true,
          gitHubApp: {
            id: "appid1234"
          }
        }]
      },
      async addComment() {}
    },
    gitHubAppId: "appid1234"
  })
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "acme",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeFalsy()
})

test("It calls the event handler if a comment exists with our GitHub app ID but that comment is not from a bot", async () => {
  let didCallEventHandler = false
  const sut = new ExistingCommentCheckingPullRequestEventHandler({
    eventHandler: {
      async pullRequestOpened() {
        didCallEventHandler = true
      }
    },
    commentRepository: {
      async getComments() {
        return [{
          isFromBot: false,
          gitHubApp: {
            id: "appid1234"
          }
        }]
      },
      async addComment() {}
    },
    gitHubAppId: "appid1234"
  })
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "acme",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeTruthy()
})

test("It calls the event handler if the repository contains a comment from a bot but that comment is not from our GitHub app", async () => {
  let didCallEventHandler = false
  const sut = new ExistingCommentCheckingPullRequestEventHandler({
    eventHandler: {
      async pullRequestOpened() {
        didCallEventHandler = true
      }
    },
    commentRepository: {
      async getComments() {
        return [{
          isFromBot: true,
          gitHubApp: {
            id: "someotherapp"
          }
        }]
      },
      async addComment() {}
    },
    gitHubAppId: "appid1234"
  })
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "acme",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeTruthy()
})
