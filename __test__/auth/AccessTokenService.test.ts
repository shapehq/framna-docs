import AccessTokenService from "../../src/features/auth/domain/AccessTokenService"

test("It reads the access token from the repository", async () => {
  const sut = new AccessTokenService({
    async getOAuthToken() {
      return {
        accessToken: "foo",
        refreshToken: "bar",
        accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000),
        refreshTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000)
      }
    },
    async storeOAuthToken() {}
  }, {
    async refreshAccessToken() {
      return {
        accessToken: "foo",
        refreshToken: "bar",
        accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000),
        refreshTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000)
      }
    }
  })
  const accessToken = await sut.getAccessToken()
  expect(accessToken).toBe("foo")
})

test("It refreshes an expired access token", async () => {
  const sut = new AccessTokenService({
    async getOAuthToken() {
      return {
        accessToken: "old",
        refreshToken: "bar",
        accessTokenExpiryDate: new Date(new Date().getTime() - 3600 * 1000),
        refreshTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000)
      }
    },
    async storeOAuthToken() {}
  }, {
    async refreshAccessToken() {
      return {
        accessToken: "new",
        refreshToken: "bar",
        accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000),
        refreshTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000)
      }
    }
  })
  const accessToken = await sut.getAccessToken()
  expect(accessToken).toBe("new")
})

test("It stores the refreshed access token", async () => {
  let didStoreRefreshedToken = false
  const sut = new AccessTokenService({
    async getOAuthToken() {
      return {
        accessToken: "old",
        refreshToken: "bar",
        accessTokenExpiryDate: new Date(new Date().getTime() - 3600 * 1000),
        refreshTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000)
      }
    },
    async storeOAuthToken() {
      didStoreRefreshedToken = true
    }
  }, {
    async refreshAccessToken() {
      return {
        accessToken: "new",
        refreshToken: "bar",
        accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000),
        refreshTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000)
      }
    }
  })
  await sut.getAccessToken()
  expect(didStoreRefreshedToken).toBeTruthy()
})

test("It errors when the refresh token has expired", async () => {
  const sut = new AccessTokenService({
    async getOAuthToken() {
      return {
        accessToken: "old",
        refreshToken: "bar",
        accessTokenExpiryDate: new Date(new Date().getTime() - 3600 * 1000),
        refreshTokenExpiryDate: new Date(new Date().getTime() - 3600 * 1000)
      }
    },
    async storeOAuthToken() {}
  }, {
    async refreshAccessToken() {
      return {
        accessToken: "new",
        refreshToken: "bar",
        accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000),
        refreshTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000)
      }
    }
  })
  await expect(sut.getAccessToken()).rejects.toThrow()
})