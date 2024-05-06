import { AccessTokenDataSource } from "../../src/features/auth/domain"

test("It skips transferring if an OAuth token already exists", async () => {
  let didTransferAccessToken = false
  const sut = new AccessTokenDataSource({
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
    oauthTokenDataSource: {
      async get(_user) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      }
    },
    accessTokenTransferrer: {
      async transferAccessToken() {
        didTransferAccessToken = true
        return "new-github-access-token"
      }
    },
    mutexFactory: {
      async makeMutex() {
        return {
          async acquire() {},
          async release() {}
        }
      }
    }
  })
  await sut.getAccessToken()
  expect(didTransferAccessToken).toBeFalsy()
})

test("It skips transferring if an OAuth token has been stored while waiting to acquire the lock", async () => {
  let didAcquireLock = false
  let didTransferAccessToken = false
  const sut = new AccessTokenDataSource({
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
    oauthTokenDataSource: {
      async get(_user) {
        if (didAcquireLock) {
          return {
            accessToken: "foo",
            refreshToken: "bar"
          }
        } else {
          return null
        }
      }
    },
    accessTokenTransferrer: {
      async transferAccessToken() {
        didTransferAccessToken = true
        return "new-github-access-token"
      }
    },
    mutexFactory: {
      async makeMutex() {
        return {
          async acquire() {
            didAcquireLock = true
          },
          async release() {}
        }
      }
    }
  })
  await sut.getAccessToken()
  expect(didAcquireLock).toBeTruthy()
  expect(didTransferAccessToken).toBeFalsy()
})

test("It does not acquire lock if an OAuth token already exists", async () => {
  let didAcquireLock = false
  const sut = new AccessTokenDataSource({
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
    oauthTokenDataSource: {
      async get(_user) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      }
    },
    accessTokenTransferrer: {
      async transferAccessToken() {
        return "new-github-access-token"
      }
    },
    mutexFactory: {
      async makeMutex() {
        return {
          async acquire() {
            didAcquireLock = true
          },
          async release() {}
        }
      }
    }
  })
  await sut.getAccessToken()
  expect(didAcquireLock).toBeFalsy()
})

test("It transfers access token if no OAuth token exists", async () => {
  let didTransferAccessToken = false
  const sut = new AccessTokenDataSource({
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
    oauthTokenDataSource: {
      async get(_user) {
        return null
      }
    },
    accessTokenTransferrer: {
      async transferAccessToken() {
        didTransferAccessToken = true
        return "new-github-access-token"
      }
    },
    mutexFactory: {
      async makeMutex() {
        return {
          async acquire() {},
          async release() {}
        }
      }
    }
  })
  const accessToken = await sut.getAccessToken()
  expect(didTransferAccessToken).toBeTruthy()
  expect(accessToken).toBe("new-github-access-token")
})

test("It acquires lock", async () => {
  let didAcquireLock = false
  const sut = new AccessTokenDataSource({
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
    oauthTokenDataSource: {
      async get(_user) {
        return null
      }
    },
    accessTokenTransferrer: {
      async transferAccessToken() {
        return "new-github-access-token"
      }
    },
    mutexFactory: {
      async makeMutex() {
        return {
          async acquire() {
            didAcquireLock = true
          },
          async release() {}
        }
      }
    }
  })
  await sut.getAccessToken()
  expect(didAcquireLock).toBeTruthy()
})

test("It releases lock", async () => {
  let didAcquireLock = false
  const sut = new AccessTokenDataSource({
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
    oauthTokenDataSource: {
      async get(_user) {
        return null
      }
    },
    accessTokenTransferrer: {
      async transferAccessToken() {
        return "new-github-access-token"
      }
    },
    mutexFactory: {
      async makeMutex() {
        return {
          async acquire() {},
          async release() {
            didAcquireLock = true
          }
        }
      }
    }
  })
  await sut.getAccessToken()
  expect(didAcquireLock).toBeTruthy()
})
