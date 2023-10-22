import RepositoryNameCheckingPullRequestEventHandler from "../../src/features/hooks/domain/RepositoryNameCheckingPullRequestEventHandler"

test("It does not call event handler when repository name does not have \"-openapi\" suffix", async () => {
  let didCallEventHandler = false
  const sut = new RepositoryNameCheckingPullRequestEventHandler({
    async pullRequestOpened() {
      didCallEventHandler = true
    }
  }, [], [])
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "shapehq",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeFalsy()
})

test("It does not call event handler when repository name contains \"-openapi\" but it is not the last part of the repository name", async () => {
  let didCallEventHandler = false
  const sut = new RepositoryNameCheckingPullRequestEventHandler({
    async pullRequestOpened() {
      didCallEventHandler = true
    }
  }, [], [])
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "shapehq",
    repositoryName: "foo-openapi-bar",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeFalsy()
})

test("It calls event handler when no repositories have been allowed or disallowed", async () => {
  let didCallEventHandler = false
  const sut = new RepositoryNameCheckingPullRequestEventHandler({
    async pullRequestOpened() {
      didCallEventHandler = true
    }
  }, [], [])
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "shapehq",
    repositoryName: "foo-openapi",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeTruthy()
})

test("It does not call event handler for repository that is not on the allowlist", async () => {
  let didCallEventHandler = false
  const sut = new RepositoryNameCheckingPullRequestEventHandler({
    async pullRequestOpened() {
      didCallEventHandler = true
    }
  }, ["example-openapi"], [])
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "shapehq",
    repositoryName: "foo",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeFalsy()
})

test("It does not call event handler for repository that is on the disallowlist", async () => {
  let didCallEventHandler = false
  const sut = new RepositoryNameCheckingPullRequestEventHandler({
    async pullRequestOpened() {
      didCallEventHandler = true
    }
  }, [], ["example-openapi"])
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "shapehq",
    repositoryName: "example-openapi",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeFalsy()
})

test("It lets the disallowlist takes precedence over the allowlist", async () => {
  let didCallEventHandler = false
  const sut = new RepositoryNameCheckingPullRequestEventHandler({
    async pullRequestOpened() {
      didCallEventHandler = true
    }
  }, ["example-openapi"], ["example-openapi"])
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "shapehq",
    repositoryName: "example-openapi",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeFalsy()
})
