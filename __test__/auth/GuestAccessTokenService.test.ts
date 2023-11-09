import { GuestAccessTokenService } from "../../src/features/auth/domain"

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
