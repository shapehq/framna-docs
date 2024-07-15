import { PullRequestCommenter } from "../../src/features/hooks/domain"

test("It adds comment when none exist", async () => {
  let didAddComment = false
  const sut = new PullRequestCommenter({
    domain: "https://example.com",
    siteName: "Demo Docs",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".demo-docs.yml",
    gitHubAppId: "appid1234",
    gitHubClient: {
      async graphql() {
        return {}
      },
      async getRepositoryContent() {
        return { downloadURL: "https://example.com" }
      },
      async getPullRequestFiles() {
        return [{
          filename: "openapi.yml",
          status: "changed"
        }]
      },
      async getPullRequestComments() {
        return []
      },
      async addCommentToPullRequest() {
        didAddComment = true
      },
      async updatePullRequestComment() {}
    }
  })
  await sut.commentPullRequest({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryOwner: "acme",
    repositoryName: "demo-openapi",
    ref: "main"
  })
  expect(didAddComment).toBeTruthy()
})

test("It adds comment containing list of changed files", async () => {
  let didAddComment = false
  let commentBody: string | undefined
  const sut = new PullRequestCommenter({
    domain: "https://example.com",
    siteName: "Demo Docs",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".demo-docs.yml",
    gitHubAppId: "appid1234",
    gitHubClient: {
      async graphql() {
        return {}
      },
      async getRepositoryContent() {
        return { downloadURL: "https://example.com" }
      },
      async getPullRequestFiles() {
        return [{
          filename: "foo.yml",
          status: "changed"
        }, {
          filename: "bar.yml",
          status: "changed"
        }]
      },
      async getPullRequestComments() {
        return []
      },
      async addCommentToPullRequest(request) {
        didAddComment = true
        commentBody = request.body
      },
      async updatePullRequestComment() {}
    }
  })
  await sut.commentPullRequest({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryOwner: "acme",
    repositoryName: "demo-openapi",
    ref: "main"
  })
  expect(didAddComment).toBeTruthy()
  expect(commentBody).toContain("<table>")
  expect(commentBody).toContain("foo.yml")
  expect(commentBody).toContain("bar.yml")
})

test("It skips adding comment when no YAML files were found in the PR", async () => {
  let didAddComment = false
  const sut = new PullRequestCommenter({
    domain: "https://example.com",
    siteName: "Demo Docs",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".demo-docs.yml",
    gitHubAppId: "appid1234",
    gitHubClient: {
      async graphql() {
        return {}
      },
      async getRepositoryContent() {
        return { downloadURL: "https://example.com" }
      },
      async getPullRequestFiles() {
        return [{
          filename: "dummy.swift",
          status: "changed"
        }]
      },
      async getPullRequestComments() {
        return []
      },
      async addCommentToPullRequest() {
        didAddComment = true
      },
      async updatePullRequestComment() {}
    }
  })
  await sut.commentPullRequest({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryOwner: "acme",
    repositoryName: "demo-openapi",
    ref: "main"
  })
  expect(didAddComment).toBeFalsy()
})

test("It updates comment when one already exists", async () => {
  let didUpdateComment = false
  const sut = new PullRequestCommenter({
    domain: "https://example.com",
    siteName: "Demo Docs",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".demo-docs.yml",
    gitHubAppId: "appid1234",
    gitHubClient: {
      async graphql() {
        return {}
      },
      async getRepositoryContent() {
        return { downloadURL: "https://example.com" }
      },
      async getPullRequestFiles() {
        return [{
          filename: "openapi.yml",
          status: "changed"
        }]
      },
      async getPullRequestComments() {
        return [{
          id: 1,
          body: "Hello world!",
          isFromBot: true,
          gitHubApp: {
            id: "appid1234"
          }
        }]
      },
      async addCommentToPullRequest() {},
      async updatePullRequestComment() {
        didUpdateComment = true
      }
    }
  })
  await sut.commentPullRequest({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryOwner: "acme",
    repositoryName: "demo-openapi",
    ref: "main"
  })
  expect(didUpdateComment).toBeTruthy()
})

test("It skips updating comment when the body has not changed", async () => {
  let addedCommentBody: string | undefined
  let didUpdateComment = false
  const sut = new PullRequestCommenter({
    domain: "https://example.com",
    siteName: "Demo Docs",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".demo-docs.yml",
    gitHubAppId: "appid1234",
    gitHubClient: {
      async graphql() {
        return {}
      },
      async getRepositoryContent() {
        return { downloadURL: "https://example.com" }
      },
      async getPullRequestFiles() {
        return [{
          filename: "openapi.yml",
          status: "changed"
        }]
      },
      async getPullRequestComments() {
        if (!addedCommentBody) {
          return []
        }
        return [{
          id: 1,
          body: addedCommentBody,
          isFromBot: true,
          gitHubApp: {
            id: "appid1234"
          }
        }]
      },
      async addCommentToPullRequest(request) {
        addedCommentBody = request.body
      },
      async updatePullRequestComment() {
        didUpdateComment = true
      }
    }
  })
  // Add a comment.
  await sut.commentPullRequest({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryOwner: "acme",
    repositoryName: "demo-openapi",
    ref: "main"
  })
  // Attempt to update a comment. This is skipped because the body has not changed.
  await sut.commentPullRequest({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryOwner: "acme",
    repositoryName: "demo-openapi",
    ref: "main"
  })
  expect(addedCommentBody).not.toBeUndefined()
  expect(didUpdateComment).toBeFalsy()
})

test("It updates comment to remove file list  when all relevant file changes were removed from the PR", async () => {
  let didAddComment = false
  let didUpdateComment = false
  let addedCommentBody: string | undefined
  let updatedCommentBody: string | undefined
  const sut = new PullRequestCommenter({
    domain: "https://example.com",
    siteName: "Demo Docs",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".demo-docs.yml",
    gitHubAppId: "appid1234",
    gitHubClient: {
      async graphql() {
        return {}
      },
      async getRepositoryContent() {
        return { downloadURL: "https://example.com" }
      },
      async getPullRequestFiles() {
        if (didAddComment) {
          // Simulate relevant files removed.
          return []
        } else {
          return [{
            filename: "openapi.yml",
            status: "changed"
          }]
        }
      },
      async getPullRequestComments() {
        if (!didAddComment) {
          return []
        }
        return [{
          id: 1,
          body: "Hello world",
          isFromBot: true,
          gitHubApp: {
            id: "appid1234"
          }
        }]
      },
      async addCommentToPullRequest(request) {
        didAddComment = true
        addedCommentBody = request.body
      },
      async updatePullRequestComment(request) {
        didUpdateComment = true
        updatedCommentBody = request.body
      }
    }
  })
  // Add a comment.
  await sut.commentPullRequest({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryOwner: "acme",
    repositoryName: "demo-openapi",
    ref: "main"
  })
  // Attempt to update a comment. This is skipped because the body has not changed.
  await sut.commentPullRequest({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryOwner: "acme",
    repositoryName: "demo-openapi",
    ref: "main"
  })
  expect(didAddComment).toBeTruthy()
  expect(didUpdateComment).toBeTruthy()
  expect(addedCommentBody).toContain("<table>")
  expect(addedCommentBody).toContain("openapi.yml")
  expect(updatedCommentBody).not.toContain("<table>")
  expect(updatedCommentBody).not.toContain("openapi.yml")
})

test("It adds comment without file table if only project configuration was edited", async () => {
  let didAddComment = false
  let commentBody: string | undefined
  const sut = new PullRequestCommenter({
    domain: "https://example.com",
    siteName: "Demo Docs",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".demo-docs.yml",
    gitHubAppId: "appid1234",
    gitHubClient: {
      async graphql() {
        return {}
      },
      async getRepositoryContent() {
        return { downloadURL: "https://example.com" }
      },
      async getPullRequestFiles() {
        return [{
          filename: ".demo-docs.yml",
          status: "changed"
        }]
      },
      async getPullRequestComments() {
        if (!didAddComment) {
          return []
        }
        return [{
          id: 1,
          body: "Hello world",
          isFromBot: true,
          gitHubApp: {
            id: "appid1234"
          }
        }]
      },
      async addCommentToPullRequest(request) {
        didAddComment = true
        commentBody = request.body
      },
      async updatePullRequestComment() {}
    }
  })
  await sut.commentPullRequest({
    appInstallationId: 1234,
    pullRequestNumber: 42,
    repositoryOwner: "acme",
    repositoryName: "demo-openapi",
    ref: "main"
  })
  expect(didAddComment).toBeTruthy()
  expect(commentBody).not.toContain("<table>")
  expect(commentBody).not.toContain(".demo-docs.yml")
})
