import { OAuthTokenDataSource } from "@/features/auth/domain"

test("It reads OAuth token for user's ID", async () => {
  let readUserId: string | undefined
  const sut = new OAuthTokenDataSource({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      }
    },
    repository: {
      async get(userId) {
        readUserId = userId
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }
  })
  await sut.getOAuthToken()
  expect(readUserId).toBe("1234")
})

test("It reads OAuth token", async () => {
  const sut = new OAuthTokenDataSource({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      }
    },
    repository: {
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
  const oauthToken = await sut.getOAuthToken()
  expect(oauthToken.accessToken).toBe("foo")
  expect(oauthToken.refreshToken).toBe("bar")
})

test("It forwards errors from repository", async () => {
  const sut = new OAuthTokenDataSource({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      }
    },
    repository: {
      async get(_userId) {
        throw new Error("OAuth token was not found")
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }
  })
  expect(sut.getOAuthToken()).rejects.toThrow()
})
