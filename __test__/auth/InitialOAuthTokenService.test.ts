import InitialOAuthTokenService from "../../src/features/auth/domain/InitialOAuthTokenService"
import OAuthToken from "../../src/features/auth/domain/OAuthToken"

test("It fetches refresh token for specified user", async () => {
  let fetchedUserId: string | undefined
  const sut = new InitialOAuthTokenService({
    refreshTokenReader: {
      async getRefreshToken(userId) {
        fetchedUserId = userId
        return ""
      }
    },
    oAuthTokenRefresher: {
      async refreshAccessToken() {
        return {
          accessToken: "foo",
          refreshToken: "bar",
          accessTokenExpiryDate: new Date(),
          refreshTokenExpiryDate: new Date()
        }
      }
    },
    oAuthTokenRepository: {
      async getOAuthToken() {
        return {
          accessToken: "foo",
          refreshToken: "bar",
          accessTokenExpiryDate: new Date(),
          refreshTokenExpiryDate: new Date()
        }
      },
      async storeOAuthToken() {},
      async deleteOAuthToken() {}
    }
  })
  await sut.fetchInitialAuthTokenForUser("123")
  expect(fetchedUserId).toBe("123")
})

test("It refreshes the fetched refresh token", async () => {
  let refreshedRefreshToken: string | undefined
  const sut = new InitialOAuthTokenService({
    refreshTokenReader: {
      async getRefreshToken() {
        return "helloworld"
      }
    },
    oAuthTokenRefresher: {
      async refreshAccessToken(refreshToken) {
        refreshedRefreshToken = refreshToken
        return {
          accessToken: "foo",
          refreshToken: "bar",
          accessTokenExpiryDate: new Date(),
          refreshTokenExpiryDate: new Date()
        }
      }
    },
    oAuthTokenRepository: {
      async getOAuthToken() {
        return {
          accessToken: "foo",
          refreshToken: "bar",
          accessTokenExpiryDate: new Date(),
          refreshTokenExpiryDate: new Date()
        }
      },
      async storeOAuthToken() {},
      async deleteOAuthToken() {}
    }
  })
  await sut.fetchInitialAuthTokenForUser("123")
  expect(refreshedRefreshToken).toBe("helloworld")
})

test("It stores the refreshed auth token for the correct user ID", async () => {
  let storedAuthToken: OAuthToken | undefined
  let storedUserId: string | undefined
  const accessTokenExpiryDate = new Date(new Date().getTime() + 3600 * 1000)
  const refreshTokenExpiryDate = new Date(new Date().getTime() + 24 * 3600 * 1000)
  const sut = new InitialOAuthTokenService({
    refreshTokenReader: {
      async getRefreshToken() {
        return "helloworld"
      }
    },
    oAuthTokenRefresher: {
      async refreshAccessToken() {
        return {
          accessToken: "foo",
          refreshToken: "bar",
          accessTokenExpiryDate: accessTokenExpiryDate,
          refreshTokenExpiryDate: refreshTokenExpiryDate
        }
      }
    },
    oAuthTokenRepository: {
      async getOAuthToken() {
        return {
          accessToken: "foo",
          refreshToken: "bar",
          accessTokenExpiryDate: new Date(),
          refreshTokenExpiryDate: new Date()
        }
      },
      async storeOAuthToken(token, userId) {
        storedAuthToken = token
        storedUserId = userId
      },
      async deleteOAuthToken() {}
    }
  })
  await sut.fetchInitialAuthTokenForUser("123")
  expect(storedAuthToken?.accessToken).toBe("foo")
  expect(storedAuthToken?.refreshToken).toBe("bar")
  expect(storedAuthToken?.accessTokenExpiryDate).toBe(accessTokenExpiryDate)
  expect(storedAuthToken?.refreshTokenExpiryDate).toBe(refreshTokenExpiryDate)
  expect(storedUserId).toBe("123")
})
