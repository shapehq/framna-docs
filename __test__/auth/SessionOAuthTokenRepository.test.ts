import SessionOAuthTokenRepository from "../../src/features/auth/domain/SessionOAuthTokenRepository"

test("It reads the auth token", async () => {
  let didRead = false
  const sut = new SessionOAuthTokenRepository({
    async get() {
      didRead = true
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
  await sut.getOAuthToken()
  expect(didRead).toBeTruthy()
})

test("It stores the auth token", async () => {
  let storedJSON: any | undefined
  const sut = new SessionOAuthTokenRepository({
    async get() {
      return ""
    },
    async set(data) {
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
  await sut.storeOAuthToken(authToken)
  const storedObj = JSON.parse(storedJSON)
  expect(storedObj.accessToken).toBe(authToken.accessToken)
  expect(storedObj.refreshToken).toBe(authToken.refreshToken)
  expect(new Date(storedObj.accessTokenExpiryDate)).toStrictEqual(authToken.accessTokenExpiryDate)
  expect(new Date(storedObj.refreshTokenExpiryDate)).toStrictEqual(authToken.refreshTokenExpiryDate)
})

test("It deletes the auth token", async () => {
  let didDelete = false
  const sut = new SessionOAuthTokenRepository({
    async get() {
      return ""
    },
    async set() {},
    async delete() {
      didDelete = true
    }
  })
  await sut.deleteOAuthToken()
  expect(didDelete).toBeTruthy()
})
