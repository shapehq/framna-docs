import { PersistingOAuthTokenDataSource, OAuthToken } from "../../src/features/auth/domain"

test("It skips obtaining an OAuth token from the data source if one already exists in the repository", async () => {
  let didGetOAuthTokenFromDataSource = false
  const sut = new PersistingOAuthTokenDataSource({
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
      async getAccountProvider() {
        return "github"
      }
    },
    dataSource: {
      async getOAuthToken() {
        didGetOAuthTokenFromDataSource = true
        return { accessToken: "new-github-access-token" }
      }
    },
    repository: {
      async get(_userId) {
        return { accessToken: "foo" }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
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
  await sut.getOAuthToken()
  expect(didGetOAuthTokenFromDataSource).toBeFalsy()
})

test("It skips obtaining an OAuth token from the data source if one has been stored while waiting to acquire the lock", async () => {
  let didAcquireLock = false
  let didGetOAuthTokenFromDataSource = false
  const sut = new PersistingOAuthTokenDataSource({
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
      async getAccountProvider() {
        return "github"
      }
    },
    dataSource: {
      async getOAuthToken() {
        throw new Error("Not found")
      }
    },
    repository: {
      async get(_userId) {
        if (didAcquireLock) {
          return { accessToken: "new-github-access-token" }
        } else {
          throw new Error("Not found")
        }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
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
  await sut.getOAuthToken()
  expect(didAcquireLock).toBeTruthy()
  expect(didGetOAuthTokenFromDataSource).toBeFalsy()
})

test("It does not acquire lock if an OAuth token already exists", async () => {
  let didAcquireLock = false
  const sut = new PersistingOAuthTokenDataSource({
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
      async getAccountProvider() {
        return "github"
      }
    },
    dataSource: {
      async getOAuthToken() {
        return { accessToken: "new-github-access-token" }
      }
    },
    repository: {
      async get(_userId) {
        return { accessToken: "foo" }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
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
  await sut.getOAuthToken()
  expect(didAcquireLock).toBeFalsy()
})

test("It obtains OAuth token from data source if one does not exist in the repository", async () => {
  let didGetOAuthTokenFromDataSource = false
  const sut = new PersistingOAuthTokenDataSource({
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
      async getAccountProvider() {
        return "github"
      }
    },
    dataSource: {
      async getOAuthToken() {
        didGetOAuthTokenFromDataSource = true
        return { accessToken: "new-github-access-token" }
      }
    },
    repository: {
      async get(_userId) {
        throw new Error("Not found")
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
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
  const oauthToken = await sut.getOAuthToken()
  expect(didGetOAuthTokenFromDataSource).toBeTruthy()
  expect(oauthToken.accessToken).toBe("new-github-access-token")
})

test("It persists the OAuth token obtained from the data source", async () => {
  let persistedOAuthToken: OAuthToken | undefined
  const sut = new PersistingOAuthTokenDataSource({
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
      async getAccountProvider() {
        return "github"
      }
    },
    dataSource: {
      async getOAuthToken() {
        return { accessToken: "new-github-access-token" }
      }
    },
    repository: {
      async get(_userId) {
        throw new Error("Not found")
      },
      async set(_userId, token) {
        persistedOAuthToken = token
      },
      async delete(_userId) {}
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
  await sut.getOAuthToken()
  expect(persistedOAuthToken?.accessToken).toBe("new-github-access-token")
})

test("It acquires the lock", async () => {
  let didAcquireLock = false
  const sut = new PersistingOAuthTokenDataSource({
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
      async getAccountProvider() {
        return "github"
      }
    },
    dataSource: {
      async getOAuthToken() {
        return { accessToken: "new-github-access-token" }
      }
    },
    repository: {
      async get(_userId) {
        throw new Error("Not found")
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
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
  await sut.getOAuthToken()
  expect(didAcquireLock).toBeTruthy()
})

test("It releases the lock", async () => {
  let didAcquireLock = false
  const sut = new PersistingOAuthTokenDataSource({
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
      async getAccountProvider() {
        return "github"
      }
    },
    dataSource: {
      async getOAuthToken() {
        return { accessToken: "new-github-access-token" }
      }
    },
    repository: {
      async get(_userId) {
        throw new Error("Not found")
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
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
  await sut.getOAuthToken()
  expect(didAcquireLock).toBeTruthy()
})
