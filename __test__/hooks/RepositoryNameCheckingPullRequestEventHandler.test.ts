import { RepositoryNameCheckingPullRequestEventHandler } from "../../src/features/hooks/domain"

test("It does not call event handler when repository name does not have \"-openapi\" suffix", async () => {
  let didCallEventHandler = false
  const sut = new RepositoryNameCheckingPullRequestEventHandler({
    eventHandler: {
      async pullRequestOpened() {
        didCallEventHandler = true
      }
    },
    repositoryNameSuffix: "-openapi",
    allowedRepositoryNames: [],
    disallowedRepositoryNames: []
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

test("It does not call event handler when repository name contains \"-openapi\" but it is not the last part of the repository name", async () => {
  let didCallEventHandler = false
  const sut = new RepositoryNameCheckingPullRequestEventHandler({
    eventHandler: {
      async pullRequestOpened() {
        didCallEventHandler = true
      }
    },
    repositoryNameSuffix: "-openapi",
    allowedRepositoryNames: [],
    disallowedRepositoryNames: []
  })
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "acme",
    repositoryName: "foo-openapi-bar",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeFalsy()
})

test("It calls event handler when no repositories have been allowed or disallowed", async () => {
  let didCallEventHandler = false
  const sut = new RepositoryNameCheckingPullRequestEventHandler({
    eventHandler: {
      async pullRequestOpened() {
        didCallEventHandler = true
      }
    },
    repositoryNameSuffix: "-openapi",
    allowedRepositoryNames: [],
    disallowedRepositoryNames: []
  })
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "acme",
    repositoryName: "foo-openapi",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeTruthy()
})

test("It does not call event handler for repository that is not on the allowlist", async () => {
  let didCallEventHandler = false
  const sut = new RepositoryNameCheckingPullRequestEventHandler({
    eventHandler: {
      async pullRequestOpened() {
        didCallEventHandler = true
      }
    },
    repositoryNameSuffix: "-openapi",
    allowedRepositoryNames: ["example-openapi"],
    disallowedRepositoryNames: []
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

test("It does not call event handler for repository that is on the disallowlist", async () => {
  let didCallEventHandler = false
  const sut = new RepositoryNameCheckingPullRequestEventHandler({
    eventHandler: {
      async pullRequestOpened() {
        didCallEventHandler = true
      }
    },
    repositoryNameSuffix: "-openapi",
    allowedRepositoryNames: [],
    disallowedRepositoryNames: ["example-openapi"]
  })
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "acme",
    repositoryName: "example-openapi",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeFalsy()
})

test("It lets the disallowlist takes precedence over the allowlist", async () => {
  let didCallEventHandler = false
  const sut = new RepositoryNameCheckingPullRequestEventHandler({
    eventHandler: {
      async pullRequestOpened() {
        didCallEventHandler = true
      }
    },
    repositoryNameSuffix: "-openapi",
    allowedRepositoryNames: ["example-openapi"],
    disallowedRepositoryNames: ["example-openapi"]
  })
  await sut.pullRequestOpened({
    appInstallationId: 42,
    repositoryOwner: "acme",
    repositoryName: "example-openapi",
    ref: "bar",
    pullRequestNumber: 1337
  })
  expect(didCallEventHandler).toBeFalsy()
})
