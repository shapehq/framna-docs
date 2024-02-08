import { LockingAccessTokenRefresher } from "../../src/features/auth/domain"

test("It acquires a lock", async () => {
  let didAcquireLock = false
  const sut = new LockingAccessTokenRefresher({
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
    accessTokenRefresher: {
      async refreshAccessToken() {
        return "foo"
      }
    }
  })
  await sut.refreshAccessToken("bar")
  expect(didAcquireLock).toBeTruthy()
})

test("It releases the acquired lock", async () => {
  let didReleaseLock = false
  const sut = new LockingAccessTokenRefresher({
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
    accessTokenRefresher: {
      async refreshAccessToken() {
        return "foo"
      }
    }
  })
  await sut.refreshAccessToken("bar")
  expect(didReleaseLock).toBeTruthy()
})

test("It refreshes access token", async () => {
  let didRefreshAccessToken = false
  const sut = new LockingAccessTokenRefresher({
    mutexFactory: {
      async makeMutex() {
        return {
          async acquire() {},
          async release() {}
        }
      }
    },
    accessTokenRefresher: {
      async refreshAccessToken() {
        didRefreshAccessToken = true
        return "foo"
      }
    }
  })
  await sut.refreshAccessToken("foo")
  expect(didRefreshAccessToken).toBeTruthy()
})
