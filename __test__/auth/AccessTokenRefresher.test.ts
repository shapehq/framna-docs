import { AccessTokenRefresher, OAuthToken } from "../../src/features/auth/domain"

test("It refreshes OAuth token using stored refresh token", async () => {
  let usedRefreshToken: string | undefined
  const sut = new AccessTokenRefresher({
    userIdReader: {
      async getUserId() {
        return "1234"
      }
    },
    oAuthTokenRefresher: {
      async refreshOAuthToken(refreshToken) {
        usedRefreshToken = refreshToken
        return { 
          accessToken: "foo",
          refreshToken: "bar"
        }
      }
    },
    oAuthTokenRepository: {
      async get() {
        return {
          accessToken: "oldAccessToken",
          refreshToken: "oldRefreshToken"
        }
      },
      async set() {},
      async delete() {}
    }
  })
  await sut.refreshAccessToken("oldAccessToken")
  expect(usedRefreshToken).toBe("oldRefreshToken")
})

test("It stores the new OAuth token for the user", async () => {
  let storedUserId: string | undefined
  let storedOAuthToken: OAuthToken | undefined
  const sut = new AccessTokenRefresher({
    userIdReader: {
      async getUserId() {
        return "1234"
      }
    },
    oAuthTokenRefresher: {
      async refreshOAuthToken() {
        return { 
          accessToken: "newAccessToken",
          refreshToken: "newRefreshToken"
        }
      }
    },
    oAuthTokenRepository: {
      async get() {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set(userId, oAuthToken) {
        storedUserId = userId
        storedOAuthToken = oAuthToken
      },
      async delete() {}
    }
  })
  await sut.refreshAccessToken("foo")
  expect(storedUserId).toBe("1234")
  expect(storedOAuthToken?.accessToken).toBe("newAccessToken")
  expect(storedOAuthToken?.refreshToken).toBe("newRefreshToken")
})

test("It refreshes the access token when the input access token is equal to the stored access token", async () => {
  let didRefreshAccessToken = false
  const sut = new AccessTokenRefresher({
    userIdReader: {
      async getUserId() {
        return "1234"
      }
    },
    oAuthTokenRefresher: {
      async refreshOAuthToken() {
        didRefreshAccessToken = true
        return { 
          accessToken: "foo",
          refreshToken: "bar"
        }
      }
    },
    oAuthTokenRepository: {
      async get() {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set() {},
      async delete() {}
    }
  })
  await sut.refreshAccessToken("foo")
  expect(didRefreshAccessToken).toBeTruthy()
})

test("It skips refreshing the access token when the input access token is not equal to the stored access token", async () => {
  let didRefreshAccessToken = false
  const sut = new AccessTokenRefresher({
    userIdReader: {
      async getUserId() {
        return "1234"
      }
    },
    oAuthTokenRefresher: {
      async refreshOAuthToken() {
        didRefreshAccessToken = true
        return { 
          accessToken: "foo",
          refreshToken: "bar"
        }
      }
    },
    oAuthTokenRepository: {
      async get() {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set() {},
      async delete() {}
    }
  })
  await sut.refreshAccessToken("outdated")
  expect(didRefreshAccessToken).toBeFalsy()
})

test("It reads user ID", async () => {
  let didReadUserId = false
  const sut = new AccessTokenRefresher({
    userIdReader: {
      async getUserId() {
        didReadUserId = true
        return "1234"
      }
    },
    oAuthTokenRefresher: {
      async refreshOAuthToken() {
        return { 
          accessToken: "foo",
          refreshToken: "bar"
        }
      }
    },
    oAuthTokenRepository: {
      async get() {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set() {},
      async delete() {}
    }
  })
  await sut.refreshAccessToken("foo")
  expect(didReadUserId).toBeTruthy()
})
