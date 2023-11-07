import GuestAccessTokenService from "../../src/features/auth/domain/accessToken/GuestAccessTokenService"

test("It gets the access token for the user", async () => {
  let readUserId: string | undefined
  const sut = new GuestAccessTokenService({
    userIdReader: {
      async getUserId() {
        return "1234"
      }
    },
    repository: {
      async get(userId) {
        readUserId = userId
        return "foo"
      },
      async set() {}
    },
    dataSource: {
      async getAccessToken() {
        return "foo"
      }
    }
  })
  const accessToken = await sut.getAccessToken()
  expect(readUserId).toBe("1234")
  expect(accessToken).toBe("foo")
})

test("It throws an error when the access token is null", async () => {
  const sut = new GuestAccessTokenService({
    userIdReader: {
      async getUserId() {
        return "1234"
      }
    },
    repository: {
      async get() {
        return null
      },
      async set() {}
    },
    dataSource: {
      async getAccessToken() {
        return "foo"
      }
    }
  })
  expect(sut.getAccessToken()).rejects.toThrow()
})
