import OAuthTokenTransferer from "../../src/features/auth/domain/OAuthTokenTransferer"
import OAuthToken from "../../src/features/auth/domain/OAuthToken"

test("It fetches refresh token for specified user", async () => {
  let fetchedUserId: string | undefined
  const sut = new OAuthTokenTransferer({
    refreshTokenReader: {
      async getRefreshToken(userId) {
        fetchedUserId = userId
        return ""
      }
    },
    oAuthTokenRefresher: {
      async refreshOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      }
    },
    oAuthTokenRepository: {
      async getOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      },
      async storeOAuthToken() {},
      async deleteOAuthToken() {}
    }
  })
  await sut.transferAuthTokenForUser("123")
  expect(fetchedUserId).toBe("123")
})

test("It refreshes the fetched refresh token", async () => {
  let refreshedRefreshToken: string | undefined
  const sut = new OAuthTokenTransferer({
    refreshTokenReader: {
      async getRefreshToken() {
        return "helloworld"
      }
    },
    oAuthTokenRefresher: {
      async refreshOAuthToken(refreshToken) {
        refreshedRefreshToken = refreshToken
        return { accessToken: "foo", refreshToken: "bar" }
      }
    },
    oAuthTokenRepository: {
      async getOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      },
      async storeOAuthToken() {},
      async deleteOAuthToken() {}
    }
  })
  await sut.transferAuthTokenForUser("123")
  expect(refreshedRefreshToken).toBe("helloworld")
})

test("It stores the refreshed auth token for the correct user ID", async () => {
  let storedAuthToken: OAuthToken | undefined
  let storedUserId: string | undefined
  const sut = new OAuthTokenTransferer({
    refreshTokenReader: {
      async getRefreshToken() {
        return "helloworld"
      }
    },
    oAuthTokenRefresher: {
      async refreshOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      }
    },
    oAuthTokenRepository: {
      async getOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      },
      async storeOAuthToken(userId, token) {
        storedAuthToken = token
        storedUserId = userId
      },
      async deleteOAuthToken() {}
    }
  })
  await sut.transferAuthTokenForUser("123")
  expect(storedAuthToken?.accessToken).toBe("foo")
  expect(storedAuthToken?.refreshToken).toBe("bar")
  expect(storedUserId).toBe("123")
})
