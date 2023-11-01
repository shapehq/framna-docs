import AccessTokenRefreshingGitHubClient from "../../../src/common/github/AccessTokenRefreshingGitHubClient"
import {
  GraphQLQueryRequest,
  GetRepositoryContentRequest,
  GetPullRequestCommentsRequest,
  AddCommentToPullRequestRequest
} from "../../../src/common/github/IGitHubClient"

test("It forwards a GraphQL request", async () => {
  let forwardedRequest: GraphQLQueryRequest | undefined
  const sut = new AccessTokenRefreshingGitHubClient({
    async getOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    },
    async storeOAuthToken() {}
  }, {
    async refreshOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    }
  }, {
    async graphql(request: GraphQLQueryRequest) {
      forwardedRequest = request
      return {}
    },
    async getRepositoryContent() {
      return { downloadURL: "https://example.com" }
    },
    async getPullRequestComments() {
      return []
    },
    async addCommentToPullRequest() {}
  })
  const request: GraphQLQueryRequest = {
    query: "foo",
    variables: { hello: "world" }
  }
  await sut.graphql(request)
  expect(forwardedRequest).toEqual(request)
})

test("It forwards a request to get the repository content", async () => {
  let forwardedRequest: GetRepositoryContentRequest | undefined
  const sut = new AccessTokenRefreshingGitHubClient({
    async getOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    },
    async storeOAuthToken() {}
  }, {
    async refreshOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    }
  }, {
    async graphql() {
      return {}
    },
    async getRepositoryContent(request: GetRepositoryContentRequest) {
      forwardedRequest = request
      return { downloadURL: "https://example.com" }
    },
    async getPullRequestComments() {
      return []
    },
    async addCommentToPullRequest() {}
  })
  const request: GetRepositoryContentRequest = {
    repositoryOwner: "foo",
    repositoryName: "bar",
    path: "hello",
    ref: "world"
  }
  await sut.getRepositoryContent(request)
  expect(forwardedRequest).toEqual(request)
})

test("It forwards a request to get comments to a pull request", async () => {
  let forwardedRequest: GetPullRequestCommentsRequest | undefined
  const sut = new AccessTokenRefreshingGitHubClient({
    async getOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    },
    async storeOAuthToken() {}
  }, {
    async refreshOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    }
  }, {
    async graphql() {
      return {}
    },
    async getRepositoryContent() {
      return { downloadURL: "https://example.com" }
    },
    async getPullRequestComments(request: GetPullRequestCommentsRequest) {
      forwardedRequest = request
      return []
    },
    async addCommentToPullRequest() {}
  })
  const request: GetPullRequestCommentsRequest = {
    appInstallationId: 1234,
    repositoryOwner: "foo",
    repositoryName: "bar",
    pullRequestNumber: 42
  }
  await sut.getPullRequestComments(request)
  expect(forwardedRequest).toEqual(request)
})

test("It forwards a request to add a comment to a pull request", async () => {
  let forwardedRequest: AddCommentToPullRequestRequest | undefined
  const sut = new AccessTokenRefreshingGitHubClient({
    async getOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    },
    async storeOAuthToken() {}
  }, {
    async refreshOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    }
  }, {
    async graphql() {
      return {}
    },
    async getRepositoryContent() {
      return { downloadURL: "https://example.com" }
    },
    async getPullRequestComments() {
      return []
    },
    async addCommentToPullRequest(request: AddCommentToPullRequestRequest) {
      forwardedRequest = request
    }
  })
  const request: AddCommentToPullRequestRequest = {
    appInstallationId: 1234,
    repositoryOwner: "foo",
    repositoryName: "bar",
    pullRequestNumber: 42,
    body: "Hello world!"
  }
  await sut.addCommentToPullRequest(request)
  expect(forwardedRequest).toEqual(request)
})

test("It retries with a refreshed access token when receiving HTTP 401", async () => {
  let didRefreshAccesstoken = false
  let didRespondWithAuthorizationError = false
  const sut = new AccessTokenRefreshingGitHubClient({
    async getOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    },
    async storeOAuthToken() {}
  }, {
    async refreshOAuthToken() {
      didRefreshAccesstoken = true
      return { accessToken: "foo", refreshToken: "bar" }
    }
  }, {
    async graphql() {
      if (!didRespondWithAuthorizationError) {
        didRespondWithAuthorizationError = true
        throw { status: 401 }
      }
      return []
    },
    async getRepositoryContent() {
      return { downloadURL: "https://example.com" }
    },
    async getPullRequestComments() {
      return []
    },
    async addCommentToPullRequest() {}
  })
  const request: GraphQLQueryRequest = {
    query: "foo",
    variables: { hello: "world" }
  }
  await sut.graphql(request)
  expect(didRefreshAccesstoken).toBeTruthy()
})

test("It only retries a request once when receiving HTTP 401", async () => {
  let requestCount = 0
  const sut = new AccessTokenRefreshingGitHubClient({
    async getOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    },
    async storeOAuthToken() {}
  }, {
    async refreshOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    }
  }, {
    async graphql() {
      requestCount += 1
      throw { status: 401 }
    },
    async getRepositoryContent() {
      return { downloadURL: "https://example.com" }
    },
    async getPullRequestComments() {
      return []
    },
    async addCommentToPullRequest() {}
  })
  const request: GraphQLQueryRequest = {
    query: "foo",
    variables: { hello: "world" }
  }
  // When receiving the second HTTP 401 the call should fail.
  await expect(sut.graphql(request)).rejects.toEqual({ status: 401 })
  // We expect two requests:
  // 1. The initial request that failed after which we refreshed the access token.
  // 2. The second request that failed after which we gave up.
  expect(requestCount).toEqual(2)
})

test("It does not refresh an access token when the initial request was successful", async () => {
  let didRefreshAccesstoken = false
  const sut = new AccessTokenRefreshingGitHubClient({
    async getOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    },
    async storeOAuthToken() {}
  }, {
    async refreshOAuthToken() {
      didRefreshAccesstoken = true
      return { accessToken: "foo", refreshToken: "bar" }
    }
  }, {
    async graphql() {
      return []
    },
    async getRepositoryContent() {
      return { downloadURL: "https://example.com" }
    },
    async getPullRequestComments() {
      return []
    },
    async addCommentToPullRequest() {}
  })
  const request: GraphQLQueryRequest = {
    query: "foo",
    variables: { hello: "world" }
  }
  await sut.graphql(request)
  expect(didRefreshAccesstoken).toBeFalsy()
})
