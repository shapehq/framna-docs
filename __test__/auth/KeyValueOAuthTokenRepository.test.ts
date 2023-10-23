import KeyValueOAuthTokenRepository from "../../src/features/auth/domain/KeyValueOAuthTokenRepository"
import OAuthToken from "../../src/features/auth/domain/OAuthToken"

test("It reads the auth token for the specified user", async () => {
  let readKey: string | undefined
  const sut = new KeyValueOAuthTokenRepository({
    async get(key) {
      readKey = key
      return JSON.stringify({
        accessToken: "foo",
        refreshToken: "bar",
        accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000),
        refreshTokenExpiryDate: new Date(new Date().getTime() + 24 * 3600 * 1000)
      })
    },
    async set() {},
    async delete() {}
  })
  await sut.getOAuthToken("123")
  expect(readKey).toBe("authToken[123]")
})

test("It stores the auth token for the specified user", async () => {
  let storedJSON: any | undefined
  let storedKey: string | undefined
  const sut = new KeyValueOAuthTokenRepository({
    async get() {
      return ""
    },
    async set(key, data) {
      storedKey = key
      storedJSON = data
    },
    async delete() {}
  })
  const authToken = {
    accessToken: "foo",
    refreshToken: "bar",
    accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000),
    refreshTokenExpiryDate: new Date(new Date().getTime() + 24 * 3600 * 1000)
  }
  await sut.storeOAuthToken(authToken, "123")
  const storedObj = JSON.parse(storedJSON)
  expect(storedKey).toBe("authToken[123]")
  expect(storedObj.accessToken).toBe(authToken.accessToken)
  expect(storedObj.refreshToken).toBe(authToken.refreshToken)
  expect(new Date(storedObj.accessTokenExpiryDate)).toStrictEqual(authToken.accessTokenExpiryDate)
  expect(new Date(storedObj.refreshTokenExpiryDate)).toStrictEqual(authToken.refreshTokenExpiryDate)
})

test("It deletes the auth token for the specified user", async () => {
  let deletedKey: string | undefined
  const sut = new KeyValueOAuthTokenRepository({
    async get() {
      return ""
    },
    async set() {},
    async delete(key) {
      deletedKey = key
    }
  })
  await sut.deleteOAuthToken("123")
  expect(deletedKey).toBe("authToken[123]")
})



test("It throws an error when the returned OAuth token does not contain an access token", async () => {
  const sut = new KeyValueOAuthTokenRepository({
    async get() {
      return JSON.stringify({
        refreshToken: "bar",
        accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000),
        refreshTokenExpiryDate: new Date(new Date().getTime() + 24 * 3600 * 1000)
      })
    },
    async set() {},
    async delete() {}
  })
  await expect(sut.getOAuthToken("123")).rejects.toThrow()
})

test("It throws an error when the returned OAuth token does not contain an refresh token", async () => {
  const sut = new KeyValueOAuthTokenRepository({
    async get() {
      return JSON.stringify({
        accessToken: "foo",
        accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000),
        refreshTokenExpiryDate: new Date(new Date().getTime() + 24 * 3600 * 1000)
      })
    },
    async set() {},
    async delete() {}
  })
  await expect(sut.getOAuthToken("123")).rejects.toThrow()
})

test("It throws an error when the returned OAuth token does not contain an expiry date for the access token", async () => {
  const sut = new KeyValueOAuthTokenRepository({
    async get() {
      return JSON.stringify({
        accessToken: "foo",
        refreshToken: "bar",
        refreshTokenExpiryDate: new Date(new Date().getTime() + 24 * 3600 * 1000)
      })
    },
    async set() {},
    async delete() {}
  })
  await expect(sut.getOAuthToken("123")).rejects.toThrow()
})

test("It throws an error when the returned OAuth token does not contain an expiry date for the refresh token", async () => {
  const sut = new KeyValueOAuthTokenRepository({
    async get() {
      return JSON.stringify({
        accessToken: "foo",
        refreshToken: "bar",
        accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000)
      })
    },
    async set() {},
    async delete() {}
  })
  await expect(sut.getOAuthToken("123")).rejects.toThrow()
})

test("It throws an error when the returned OAuth token does not contain a valid expiry date for the access token", async () => {
  const sut = new KeyValueOAuthTokenRepository({
    async get() {
      return JSON.stringify({
        accessToken: "foo",
        refreshToken: "bar",
        accessTokenExpiryDate: "baz",
        refreshTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000)
      })
    },
    async set() {},
    async delete() {}
  })
  await expect(sut.getOAuthToken("123")).rejects.toThrow()
})

test("It throws an error when the returned OAuth token does not contain a valid expiry date for the refresh token", async () => {
  const sut = new KeyValueOAuthTokenRepository({
    async get() {
      return JSON.stringify({
        accessToken: "foo",
        refreshToken: "bar",
        accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000),
        refreshTokenExpiryDate: "baz"
      })
    },
    async set() {},
    async delete() {}
  })
  await expect(sut.getOAuthToken("123")).rejects.toThrow()
})
