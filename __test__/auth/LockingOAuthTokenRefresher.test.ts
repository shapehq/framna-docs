import LockingOAuthTokenRefresher from "../../src/features/auth/domain/LockingOAuthTokenRefresher"
import OAuthToken from "../../src/features/auth/domain/OAuthToken"

test("It acquires a lock", async () => {
  let didAcquireLock = false
  const sut = new LockingOAuthTokenRefresher({
    async makeMutex() {
      return {
        async acquire() {
          didAcquireLock = true
        },
        async release() {}
      }
    }
  }, {
    async getOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    },
    async storeOAuthToken() {},
    async deleteOAuthToken() {}
  }, {
    async refreshOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    }
  })
  await sut.refreshOAuthToken("bar")
  expect(didAcquireLock).toBeTruthy()
})

test("It releases the acquired lock", async () => {
  let didReleaseLock = false
  const sut = new LockingOAuthTokenRefresher({
    async makeMutex() {
      return {
        async acquire() {},
        async release() {
          didReleaseLock = true
        }
      }
    }
  }, {
    async getOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    },
    async storeOAuthToken() {},
    async deleteOAuthToken() {}
  }, {
    async refreshOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    }
  })
  await sut.refreshOAuthToken("bar")
  expect(didReleaseLock).toBeTruthy()
})

test("It refreshes the access token when the input refresh token matches the stored refresh token", async () => {
  let didRefreshAccessToken = false
  const sut = new LockingOAuthTokenRefresher({
    async makeMutex() {
      return {
        async acquire() {},
        async release() {}
      }
    }
  }, {
    async getOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    },
    async storeOAuthToken() {},
    async deleteOAuthToken() {}
  }, {
    async refreshOAuthToken() {
      didRefreshAccessToken = true
      return { accessToken: "foo", refreshToken: "bar" }
    }
  })
  await sut.refreshOAuthToken("bar")
  expect(didRefreshAccessToken).toBeTruthy()
})

test("It skips refreshing the access token when the input refresh token is not equal to the stored refresh token", async () => {
  let didRefreshAccessToken = false
  const sut = new LockingOAuthTokenRefresher({
    async makeMutex() {
      return {
        async acquire() {},
        async release() {}
      }
    }
  }, {
    async getOAuthToken() {
      return { accessToken: "new", refreshToken: "bar" }
    },
    async storeOAuthToken() {},
    async deleteOAuthToken() {}
  }, {
    async refreshOAuthToken() {
      didRefreshAccessToken = true
      return { accessToken: "foo", refreshToken: "bar" }
    }
  })
  await sut.refreshOAuthToken("outdated")
  expect(didRefreshAccessToken).toBeFalsy()
})

test("It stores the refreshed tokens", async () => {
  let storedToken: OAuthToken | undefined
  const sut = new LockingOAuthTokenRefresher({
    async makeMutex() {
      return {
        async acquire() {},
        async release() {}
      }
    }
  }, {
    async getOAuthToken() {
      return { accessToken: "foo", refreshToken: "bar" }
    },
    async storeOAuthToken(token) {
      storedToken = token
    },
    async deleteOAuthToken() {}
  }, {
    async refreshOAuthToken() {
      return { accessToken: "newAccessToken", refreshToken: "newRefreshToken" }
    }
  })
  await sut.refreshOAuthToken("bar")
  expect(storedToken?.accessToken).toEqual("newAccessToken")
  expect(storedToken?.refreshToken).toEqual("newRefreshToken")
})
