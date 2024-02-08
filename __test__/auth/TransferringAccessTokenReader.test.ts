import { TransferringAccessTokenReader } from "../../src/features/auth/domain"

test("It reads user ID", async () => {
  let didReadUserId = false
  const sut = new TransferringAccessTokenReader({
    userIdReader: {
      async getUserId() {
        didReadUserId = true
        return "1234"
      },
    },
    sourceOAuthTokenRepository: {
      async get() {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set() {},
      async delete() {}
    },
    destinationOAuthTokenRepository: {
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
  await sut.getAccessToken()
  expect(didReadUserId).toBeTruthy()
})

test("It skips reading from source repository if a token was found in the destination repository", async () => {
  let didReadOAuthTokenFromSource = false
  let didReadOAuthTokenFromDestination = false
  const sut = new TransferringAccessTokenReader({
    userIdReader: {
      async getUserId() {
        return "1234"
      },
    },
    sourceOAuthTokenRepository: {
      async get() {
        didReadOAuthTokenFromSource = true
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set() {},
      async delete() {}
    },
    destinationOAuthTokenRepository: {
      async get() {
        didReadOAuthTokenFromDestination = true
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set() {},
      async delete() {}
    }
  })
  await sut.getAccessToken()
  expect(didReadOAuthTokenFromSource).toBeFalsy()
  expect(didReadOAuthTokenFromDestination).toBeTruthy()
})

test("It reads from source repository if no token was found in destination repository", async () => {
  let didReadOAuthTokenFromSource = false
  let didReadOAuthTokenFromDestination = false
  const sut = new TransferringAccessTokenReader({
    userIdReader: {
      async getUserId() {
        return "1234"
      },
    },
    sourceOAuthTokenRepository: {
      async get() {
        didReadOAuthTokenFromSource = true
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set() {},
      async delete() {}
    },
    destinationOAuthTokenRepository: {
      async get() {
        didReadOAuthTokenFromDestination = true
        throw new Error("No token found")
      },
      async set() {},
      async delete() {}
    }
  })
  await sut.getAccessToken()
  expect(didReadOAuthTokenFromSource).toBeTruthy()
  expect(didReadOAuthTokenFromDestination).toBeTruthy()
})

test("It stores token read from source repository in destination repository", async () => {
  let storedAccessToken: string | undefined
  let storedRefreshToken: string | undefined
  const sut = new TransferringAccessTokenReader({
    userIdReader: {
      async getUserId() {
        return "1234"
      },
    },
    sourceOAuthTokenRepository: {
      async get() {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set() {},
      async delete() {}
    },
    destinationOAuthTokenRepository: {
      async get() {
        throw new Error("No token found")
      },
      async set(_userId, token) {
        storedAccessToken = token.accessToken
        storedRefreshToken = token.refreshToken
      },
      async delete() {}
    }
  })
  await sut.getAccessToken()
  expect(storedAccessToken).toEqual("foo")
  expect(storedRefreshToken).toEqual("bar")
})
