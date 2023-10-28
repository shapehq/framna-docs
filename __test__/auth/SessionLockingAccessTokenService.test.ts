import SessionLockingAccessTokenService from "../../src/features/auth/domain/SessionLockingAccessTokenService"

test("It acquires a lock", async () => {
  let didAcquireLock = false
  const sut = new SessionLockingAccessTokenService({
    async getUserId() {
      return "foo"
    }
  }, {
    makeMutex() {
      return {
        async acquire() {
          didAcquireLock = true
        },
        async release() {}
      }
    }
  }, {
    async getAccessToken() {
      return ""
    }
  })
  await sut.getAccessToken()
  expect(didAcquireLock).toBeTruthy()
})

test("It releases the acquired lock", async () => {
  let didReleaseLock = false
  const sut = new SessionLockingAccessTokenService({
    async getUserId() {
      return "foo"
    }
  }, {
    makeMutex() {
      return {
        async acquire() {},
        async release() {
          didReleaseLock = true
        }
      }
    }
  }, {
    async getAccessToken() {
      return ""
    }
  })
  await sut.getAccessToken()
  expect(didReleaseLock).toBeTruthy()
})

test.only("It performs operations sequentially", async () => {
  let didReleaseLock = false
  const sut = new SessionLockingAccessTokenService({
    async getUserId() {
      return "foo"
    }
  }, {
    makeMutex() {
      return {
        async acquire() {},
        async release() {
          didReleaseLock = true
        }
      }
    }
  }, {
    async getAccessToken() {
      return ""
    }
  })
  await Promise.all([
    sut.getAccessToken(),
    sut.getAccessToken(),
    sut.getAccessToken(),
    sut.getAccessToken(),
    sut.getAccessToken()
  ])
  expect(didReleaseLock).toBeTruthy()
})
