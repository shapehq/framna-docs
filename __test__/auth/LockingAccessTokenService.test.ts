import LockingAccessTokenService from "../../src/features/auth/domain/accessToken/LockingAccessTokenService"

test("It reads access token", async () => {
  let didReadAccessToken = false
  const sut = new LockingAccessTokenService({
    async makeMutex() {
      return {
        async acquire() {},
        async release() {}
      }
    }
  }, {
    async getAccessToken() {
      didReadAccessToken = true
      return "foo"
    },
    async refreshAccessToken() {
      return "foo"
    }
  })
  await sut.getAccessToken()
  expect(didReadAccessToken).toBeTruthy()
})

test("It acquires a lock", async () => {
  let didAcquireLock = false
  const sut = new LockingAccessTokenService({
    async makeMutex() {
      return {
        async acquire() {
          didAcquireLock = true
        },
        async release() {}
      }
    }
  }, {
    async getAccessToken() {
      return "foo"
    },
    async refreshAccessToken() {
      return "foo"
    }
  })
  await sut.refreshAccessToken("bar")
  expect(didAcquireLock).toBeTruthy()
})

test("It releases the acquired lock", async () => {
  let didReleaseLock = false
  const sut = new LockingAccessTokenService({
    async makeMutex() {
      return {
        async acquire() {},
        async release() {
          didReleaseLock = true
        }
      }
    }
  }, {
    async getAccessToken() {
      return "foo"
    },
    async refreshAccessToken() {
      return "foo"
    }
  })
  await sut.refreshAccessToken("bar")
  expect(didReleaseLock).toBeTruthy()
})

test("It refreshes access token", async () => {
  let didRefreshAccessToken = false
  const sut = new LockingAccessTokenService({
    async makeMutex() {
      return {
        async acquire() {},
        async release() {}
      }
    }
  }, {
    async getAccessToken() {
      return "foo"
    },
    async refreshAccessToken() {
      didRefreshAccessToken = true
      return "foo"
    }
  })
  await sut.refreshAccessToken("foo")
  expect(didRefreshAccessToken).toBeTruthy()
})
