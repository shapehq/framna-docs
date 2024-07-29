import { FilteringPullRequestEventHandler } from "@/features/hooks/domain"

test("It calls pullRequestOpened(_:) when event is included", async () => {
  let didCall = false
  const sut = new FilteringPullRequestEventHandler({
    filter: {
      includeEvent(_event) {
        return true
      }
    },
    eventHandler: {
      async pullRequestOpened(_event) {
        didCall = true
      },
      async pullRequestReopened(_event) {},
      async pullRequestSynchronized(_event) {}
    }
  })
  await sut.pullRequestOpened({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryName: "demo-openapi",
    repositoryOwner: "acme",
    ref: "main"
  })
  expect(didCall).toBeTruthy()
})

test("It calls pullRequestReopened(_:) when event is included", async () => {
  let didCall = false
  const sut = new FilteringPullRequestEventHandler({
    filter: {
      includeEvent(_event) {
        return true
      }
    },
    eventHandler: {
      async pullRequestOpened(_event) {},
      async pullRequestReopened(_event) {
        didCall = true
      },
      async pullRequestSynchronized(_event) {}
    }
  })
  await sut.pullRequestReopened({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryName: "demo-openapi",
    repositoryOwner: "acme",
    ref: "main"
  })
  expect(didCall).toBeTruthy()
})

test("It calls pullRequestSynchronized(_:) when event is included", async () => {
  let didCall = false
  const sut = new FilteringPullRequestEventHandler({
    filter: {
      includeEvent(_event) {
        return true
      }
    },
    eventHandler: {
      async pullRequestOpened(_event) {},
      async pullRequestReopened(_event) {},
      async pullRequestSynchronized(_event) {
        didCall = true
      }
    }
  })
  await sut.pullRequestSynchronized({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryName: "demo-openapi",
    repositoryOwner: "acme",
    ref: "main"
  })
  expect(didCall).toBeTruthy()
})

test("It skips calling pullRequestOpened(_:) when event is not included", async () => {
  let didCall = false
  const sut = new FilteringPullRequestEventHandler({
    filter: {
      includeEvent(_event) {
        return false
      }
    },
    eventHandler: {
      async pullRequestOpened(_event) {
        didCall = true
      },
      async pullRequestReopened(_event) {},
      async pullRequestSynchronized(_event) {}
    }
  })
  await sut.pullRequestOpened({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryName: "demo-openapi",
    repositoryOwner: "acme",
    ref: "main"
  })
  expect(didCall).toBeFalsy()
})

test("It skips calling pullRequestReopened(_:) when event is not included", async () => {
  let didCall = false
  const sut = new FilteringPullRequestEventHandler({
    filter: {
      includeEvent(_event) {
        return false
      }
    },
    eventHandler: {
      async pullRequestOpened(_event) {},
      async pullRequestReopened(_event) {
        didCall = true
      },
      async pullRequestSynchronized(_event) {}
    }
  })
  await sut.pullRequestReopened({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryName: "demo-openapi",
    repositoryOwner: "acme",
    ref: "main"
  })
  expect(didCall).toBeFalsy()
})

test("It skips calling pullRequestSynchronized(_:) when event is not included", async () => {
  let didCall = false
  const sut = new FilteringPullRequestEventHandler({
    filter: {
      includeEvent(_event) {
        return false
      }
    },
    eventHandler: {
      async pullRequestOpened(_event) {},
      async pullRequestReopened(_event) {},
      async pullRequestSynchronized(_event) {
        didCall = true
      }
    }
  })
  await sut.pullRequestSynchronized({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryName: "demo-openapi",
    repositoryOwner: "acme",
    ref: "main"
  })
  expect(didCall).toBeFalsy()
})