import { PersistingOAuthTokenRefresher, OAuthToken } from "../../src/features/auth/domain"

test("It refreshes OAuth token using provided refresh token", async () => {
  let usedRefreshToken: string | undefined
  const sut = new PersistingOAuthTokenRefresher({
    userIdReader: {
      async getUserId() {
        return "1234"
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken(oauthToken) {
        usedRefreshToken = oauthToken.refreshToken
        return { 
          accessToken: "newAccessToken",
          refreshToken: "newRefreshToken"
        }
      }
    },
    oauthTokenRepository: {
      async get() {
        return {
          accessToken: "persistedAccessToken",
          refreshToken: "persistedRefreshToken"
        }
      },
      async set() {},
      async delete() {}
    }
  })
  await sut.refreshOAuthToken({
    accessToken: "persistedAccessToken",
    refreshToken: "persistedRefreshToken"
  })
  expect(usedRefreshToken).toBe("persistedRefreshToken")
})

test("It stores the new OAuth token for the user", async () => {
  let storedUserId: string | undefined
  let storedOAuthToken: OAuthToken | undefined
  const sut = new PersistingOAuthTokenRefresher({
    userIdReader: {
      async getUserId() {
        return "1234"
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken() {
        return { 
          accessToken: "newAccessToken",
          refreshToken: "newRefreshToken"
        }
      }
    },
    oauthTokenRepository: {
      async get() {
        return {
          accessToken: "persistedAccessToken",
          refreshToken: "persistedRefreshToken"
        }
      },
      async set(userId, oAuthToken) {
        storedUserId = userId
        storedOAuthToken = oAuthToken
      },
      async delete() {}
    }
  })
  await sut.refreshOAuthToken({
    accessToken: "persistedAccessToken",
    refreshToken: "persistedRefreshToken"
  })
  expect(storedUserId).toBe("1234")
  expect(storedOAuthToken?.accessToken).toBe("newAccessToken")
  expect(storedOAuthToken?.refreshToken).toBe("newRefreshToken")
})

test("It refreshes the OAuth token when the input refresh token is equal to the stored refresh token", async () => {
  let didRefreshOAuthToken = false
  const sut = new PersistingOAuthTokenRefresher({
    userIdReader: {
      async getUserId() {
        return "1234"
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken() {
        didRefreshOAuthToken = true
        return { 
          accessToken: "newAccessToken",
          refreshToken: "newRefreshToken"
        }
      }
    },
    oauthTokenRepository: {
      async get() {
        return {
          accessToken: "persistedAccessToken",
          refreshToken: "persistedRefreshToken"
        }
      },
      async set() {},
      async delete() {}
    }
  })
  await sut.refreshOAuthToken({
    accessToken: "persistedAccessToken",
    refreshToken: "persistedRefreshToken"
  })
  expect(didRefreshOAuthToken).toBeTruthy()
})

test("It skips refreshing the OAuth token when the input refresh token is not equal to the stored refresh token", async () => {
  let didRefreshAccessToken = false
  const sut = new PersistingOAuthTokenRefresher({
    userIdReader: {
      async getUserId() {
        return "1234"
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken() {
        didRefreshAccessToken = true
        return { 
          accessToken: "newAccessToken",
          refreshToken: "newRefreshToken"
        }
      }
    },
    oauthTokenRepository: {
      async get() {
        return {
          accessToken: "persistedAccessToken",
          refreshToken: "persistedRefreshToken"
        }
      },
      async set() {},
      async delete() {}
    }
  })
  await sut.refreshOAuthToken({ accessToken: "foo", refreshToken: "bar" })
  expect(didRefreshAccessToken).toBeFalsy()
})

test("It reads the user ID", async () => {
  let didReadUserId = false
  const sut = new PersistingOAuthTokenRefresher({
    userIdReader: {
      async getUserId() {
        didReadUserId = true
        return "1234"
      }
    },
    oauthTokenRefresher: {
      async refreshOAuthToken() {
        return { 
          accessToken: "foo",
          refreshToken: "bar"
        }
      }
    },
    oauthTokenRepository: {
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
  await sut.refreshOAuthToken({ accessToken: "foo", refreshToken: "bar" })
  expect(didReadUserId).toBeTruthy()
})
