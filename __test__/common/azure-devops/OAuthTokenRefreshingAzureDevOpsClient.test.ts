import OAuthTokenRefreshingAzureDevOpsClient from "@/common/azure-devops/OAuthTokenRefreshingAzureDevOpsClient"
import { AzureDevOpsError } from "@/common/azure-devops/AzureDevOpsError"
import IAzureDevOpsClient from "@/common/azure-devops/IAzureDevOpsClient"

function createMockClient(overrides: Partial<IAzureDevOpsClient> = {}): IAzureDevOpsClient {
  return {
    async getRepositories() {
      return []
    },
    async getRefs() {
      return []
    },
    async getItems() {
      return []
    },
    async getFileContent() {
      return null
    },
    ...overrides
  }
}

test("It forwards a request to getRepositories", async () => {
  let didForwardRequest = false
  const sut = new OAuthTokenRefreshingAzureDevOpsClient({
    oauthTokenDataSource: {
      async getOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken() {
        return { accessToken: "newAccessToken", refreshToken: "newRefreshToken" }
      }
    },
    client: createMockClient({
      async getRepositories() {
        didForwardRequest = true
        return [{ id: "1", name: "test", webUrl: "https://test", project: { id: "1", name: "proj" } }]
      }
    })
  })
  await sut.getRepositories()
  expect(didForwardRequest).toBeTruthy()
})

test("It forwards a request to getRefs", async () => {
  let forwardedRepoId: string | undefined
  const sut = new OAuthTokenRefreshingAzureDevOpsClient({
    oauthTokenDataSource: {
      async getOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken() {
        return { accessToken: "newAccessToken", refreshToken: "newRefreshToken" }
      }
    },
    client: createMockClient({
      async getRefs(repositoryId) {
        forwardedRepoId = repositoryId
        return [{ name: "refs/heads/main", objectId: "abc123" }]
      }
    })
  })
  await sut.getRefs("repo-123")
  expect(forwardedRepoId).toEqual("repo-123")
})

test("It forwards a request to getItems", async () => {
  let forwardedParams: { repoId?: string, path?: string, version?: string } = {}
  const sut = new OAuthTokenRefreshingAzureDevOpsClient({
    oauthTokenDataSource: {
      async getOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken() {
        return { accessToken: "newAccessToken", refreshToken: "newRefreshToken" }
      }
    },
    client: createMockClient({
      async getItems(repositoryId, scopePath, version) {
        forwardedParams = { repoId: repositoryId, path: scopePath, version }
        return []
      }
    })
  })
  await sut.getItems("repo-123", "/", "main")
  expect(forwardedParams).toEqual({ repoId: "repo-123", path: "/", version: "main" })
})

test("It forwards a request to getFileContent", async () => {
  let forwardedParams: { repoId?: string, path?: string, version?: string } = {}
  const sut = new OAuthTokenRefreshingAzureDevOpsClient({
    oauthTokenDataSource: {
      async getOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken() {
        return { accessToken: "newAccessToken", refreshToken: "newRefreshToken" }
      }
    },
    client: createMockClient({
      async getFileContent(repositoryId, path, version) {
        forwardedParams = { repoId: repositoryId, path, version }
        return "file content"
      }
    })
  })
  await sut.getFileContent("repo-123", "openapi.yml", "main")
  expect(forwardedParams).toEqual({ repoId: "repo-123", path: "openapi.yml", version: "main" })
})

test("It retries with a refreshed OAuth token when receiving an auth error", async () => {
  let didRefreshOAuthToken = false
  let didRespondWithAuthError = false
  const sut = new OAuthTokenRefreshingAzureDevOpsClient({
    oauthTokenDataSource: {
      async getOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken() {
        didRefreshOAuthToken = true
        return { accessToken: "newAccessToken", refreshToken: "newRefreshToken" }
      }
    },
    client: createMockClient({
      async getRepositories() {
        if (!didRespondWithAuthError) {
          didRespondWithAuthError = true
          throw new AzureDevOpsError("Unauthorized", 401, true)
        }
        return []
      }
    })
  })
  await sut.getRepositories()
  expect(didRefreshOAuthToken).toBeTruthy()
})

test("It only retries a request once when receiving auth errors", async () => {
  let requestCount = 0
  const sut = new OAuthTokenRefreshingAzureDevOpsClient({
    oauthTokenDataSource: {
      async getOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken() {
        return { accessToken: "newAccessToken", refreshToken: "newRefreshToken" }
      }
    },
    client: createMockClient({
      async getRepositories() {
        requestCount += 1
        throw new AzureDevOpsError("Unauthorized", 401, true)
      }
    })
  })
  // When receiving the second auth error the call should fail.
  await expect(sut.getRepositories()).rejects.toThrow("Unauthorized")
  // We expect two requests:
  // 1. The initial request that failed after which we refreshed the OAuth token.
  // 2. The second request that failed after which we gave up.
  expect(requestCount).toEqual(2)
})

test("It does not refresh an OAuth token when the initial request was successful", async () => {
  let didRefreshOAuthToken = false
  const sut = new OAuthTokenRefreshingAzureDevOpsClient({
    oauthTokenDataSource: {
      async getOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken() {
        didRefreshOAuthToken = true
        return { accessToken: "newAccessToken", refreshToken: "newRefreshToken" }
      }
    },
    client: createMockClient({
      async getRepositories() {
        return []
      }
    })
  })
  await sut.getRepositories()
  expect(didRefreshOAuthToken).toBeFalsy()
})

test("It does not refresh OAuth token for non-auth errors", async () => {
  let didRefreshOAuthToken = false
  const sut = new OAuthTokenRefreshingAzureDevOpsClient({
    oauthTokenDataSource: {
      async getOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken() {
        didRefreshOAuthToken = true
        return { accessToken: "newAccessToken", refreshToken: "newRefreshToken" }
      }
    },
    client: createMockClient({
      async getRepositories() {
        throw new AzureDevOpsError("Not Found", 404, false)
      }
    })
  })
  await expect(sut.getRepositories()).rejects.toThrow("Not Found")
  expect(didRefreshOAuthToken).toBeFalsy()
})

test("It does not refresh OAuth token for non-AzureDevOpsError errors", async () => {
  let didRefreshOAuthToken = false
  const sut = new OAuthTokenRefreshingAzureDevOpsClient({
    oauthTokenDataSource: {
      async getOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken() {
        didRefreshOAuthToken = true
        return { accessToken: "newAccessToken", refreshToken: "newRefreshToken" }
      }
    },
    client: createMockClient({
      async getRepositories() {
        throw new Error("Some random error")
      }
    })
  })
  await expect(sut.getRepositories()).rejects.toThrow("Some random error")
  expect(didRefreshOAuthToken).toBeFalsy()
})
