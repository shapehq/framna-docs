import { LockingOAuthTokenRefresher } from "../../src/features/auth/domain"

test("It acquires a lock", async () => {
  let didAcquireLock = false
  const sut = new LockingOAuthTokenRefresher({
    mutexFactory: {
      async makeMutex() {
        return {
          async acquire() {
            didAcquireLock = true
          },
          async release() {}
        }
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken(_refreshToken) {
        return {
          accessToken: "newAccessToken",
          refreshToken: "newRefreshToken"
        }
      }
    }
  })
  await sut.refreshOAuthToken({ accessToken: "foo", refreshToken: "bar" })
  expect(didAcquireLock).toBeTruthy()
})

test("It releases the acquired lock", async () => {
  let didReleaseLock = false
  const sut = new LockingOAuthTokenRefresher({
    mutexFactory: {
      async makeMutex() {
        return {
          async acquire() {},
          async release() {
            didReleaseLock = true
          }
        }
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken(_refreshToken) {
        return {
          accessToken: "newAccessToken",
          refreshToken: "newRefreshToken"
        }
      }
    }
  })
  await sut.refreshOAuthToken({ accessToken: "foo", refreshToken: "bar" })
  expect(didReleaseLock).toBeTruthy()
})

test("It refreshes access token", async () => {
  let didRefreshAccessToken = false
  const sut = new LockingOAuthTokenRefresher({
    mutexFactory: {
      async makeMutex() {
        return {
          async acquire() {},
          async release() {}
        }
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken(_refreshToken) {
        didRefreshAccessToken = true
        return {
          accessToken: "newAccessToken",
          refreshToken: "newRefreshToken"
        }
      }
    }
  })
  await sut.refreshOAuthToken({ accessToken: "foo", refreshToken: "bar" })
  expect(didRefreshAccessToken).toBeTruthy()
})
