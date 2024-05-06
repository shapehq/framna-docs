import { GitHubAccessTokenTransferrer } from "../../src/features/auth/domain"

test("It reads the user ID", async () => {
  let didReadUserId = false
  const sut = new GitHubAccessTokenTransferrer({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        didReadUserId = true
        return "1234"
      },
      async getEmail() {
        return "john@example.com"
      },
      async getAccountProviderType() {
        return "github"
      }
    },
    sourceOAuthTokenDataSource: {
      async get(_userId) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      }
    },
    destinationOAuthTokenRepository: {
      async get(_userId) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }
  })
  await sut.transferAccessToken()
  expect(didReadUserId).toBeTruthy()
})

test("It reads the OAuth token from the data source", async () => {
  let didReadOAuthToken = false
  const sut = new GitHubAccessTokenTransferrer({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      },
      async getEmail() {
        return "john@example.com"
      },
      async getAccountProviderType() {
        return "github"
      }
    },
    sourceOAuthTokenDataSource: {
      async get(_userId) {
        didReadOAuthToken = true
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      }
    },
    destinationOAuthTokenRepository: {
      async get(_userId) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }
  })
  await sut.transferAccessToken()
  expect(didReadOAuthToken).toBeTruthy()
})

test("It stores the OAuth token in the destination repository", async () => {
  let didStoreOAuthToken = false
  const sut = new GitHubAccessTokenTransferrer({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      },
      async getEmail() {
        return "john@example.com"
      },
      async getAccountProviderType() {
        return "github"
      }
    },
    sourceOAuthTokenDataSource: {
      async get(_userId) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      }
    },
    destinationOAuthTokenRepository: {
      async get(_userId) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set(_userId, _token) {
        didStoreOAuthToken = true
      },
      async delete(_userId) {}
    }
  })
  await sut.transferAccessToken()
  expect(didStoreOAuthToken).toBeTruthy()
})

test("It stores the OAuth token that was read from the data source for the user ID", async () => {
  let storedUserId: string | undefined
  let storedAccessToken: string | undefined
  let storedRefreshToken: string | undefined
  const sut = new GitHubAccessTokenTransferrer({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      },
      async getEmail() {
        return "john@example.com"
      },
      async getAccountProviderType() {
        return "github"
      }
    },
    sourceOAuthTokenDataSource: {
      async get(_userId) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      }
    },
    destinationOAuthTokenRepository: {
      async get(_userId) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set(userId, token) {
        storedUserId = userId
        storedAccessToken = token.accessToken
        storedRefreshToken = token.refreshToken
      },
      async delete(_userId) {}
    }
  })
  await sut.transferAccessToken()
  expect(storedUserId).toBe("1234")
  expect(storedAccessToken).toBe("foo")
  expect(storedRefreshToken).toBe("bar")
})

test("It returns newly created access token", async () => {
  const sut = new GitHubAccessTokenTransferrer({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      },
      async getEmail() {
        return "john@example.com"
      },
      async getAccountProviderType() {
        return "github"
      }
    },
    sourceOAuthTokenDataSource: {
      async get(_userId) {
        return {
          accessToken: "foo-bar",
          refreshToken: "bar"
        }
      }
    },
    destinationOAuthTokenRepository: {
      async get(_userId) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }
  })
  const accessToken = await sut.transferAccessToken()
  expect(accessToken).toBe("foo-bar")
})
