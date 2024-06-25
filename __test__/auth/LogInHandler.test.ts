import { LogInHandler } from "../../src/features/auth/domain"

test("It disallows logging in when account is undefined", async () => {
  const sut = new LogInHandler({
    oauthTokenRepository: {
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {},
      async delete(_userId) {},
    }
  })
  const didLogin = await sut.handleLogIn("1234")
  expect(didLogin).toBeFalsy()
})

test("It allows logging in when account has \"nodemailer\" provider", async () => {
  const sut = new LogInHandler({
    oauthTokenRepository: {
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {},
      async delete(_userId) {},
    }
  })
  const didLogin = await sut.handleLogIn("1234", {
    provider: "nodemailer",
    providerAccountId: "foo@example.com"
  })
  expect(didLogin).toBeTruthy()
})

test("It disallows logging in using a GitHub Account without an access token", async () => {
  const sut = new LogInHandler({
    oauthTokenRepository: {
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {},
      async delete(_userId) {},
    }
  })
  const didLogin = await sut.handleLogIn("1234", {
    provider: "github",
    providerAccountId: "foo@example.com",
    refresh_token: "bar"
  })
  expect(didLogin).toBeFalsy()
})

test("It disallows logging in using a GitHub Account without a refresh token", async () => {
  const sut = new LogInHandler({
    oauthTokenRepository: {
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {},
      async delete(_userId) {},
    }
  })
  const didLogin = await sut.handleLogIn("1234", {
    provider: "github",
    providerAccountId: "foo@example.com",
    access_token: "foo"
  })
  expect(didLogin).toBeFalsy()
})

test("It allows logging in when using a GitHub account that has an access token and a refresh token", async () => {
  const sut = new LogInHandler({
    oauthTokenRepository: {
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {},
      async delete(_userId) {},
    }
  })
  const didLogin = await sut.handleLogIn("1234", {
    provider: "github",
    providerAccountId: "foo@example.com",
    access_token: "foo",
    refresh_token: "bar"
  })
  expect(didLogin).toBeTruthy()
})

test("It persists access token and refresh token when logging in with GitHub account", async () => {
  let persistedUserId: string | undefined
  let persistedAccessToken: string | undefined
  let persistedRefreshToken: string | undefined
  const sut = new LogInHandler({
    oauthTokenRepository: {
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(userId, token) {
        persistedUserId = userId
        persistedAccessToken = token.accessToken
        persistedRefreshToken = token.refreshToken
      },
      async delete(_userId) {},
    }
  })
  const didLogin = await sut.handleLogIn("1234", {
    provider: "github",
    providerAccountId: "foo@example.com",
    access_token: "foo",
    refresh_token: "bar"
  })
  expect(didLogin).toBeTruthy()
  expect(persistedUserId).toBe("1234")
  expect(persistedAccessToken).toBe("foo")
  expect(persistedRefreshToken).toBe("bar")
})

test("It disallows logging in when failing to persist access token and refresh token for GitHub account", async () => {
  let didAttemptToPersistTokens = false
  const sut = new LogInHandler({
    oauthTokenRepository: {
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {
        didAttemptToPersistTokens = true
        throw new Error("Mock error")
      },
      async delete(_userId) {},
    }
  })
  const didLogin = await sut.handleLogIn("1234", {
    provider: "github",
    providerAccountId: "foo@example.com",
    access_token: "foo",
    refresh_token: "bar"
  })
  expect(didLogin).toBeFalsy()
  expect(didAttemptToPersistTokens).toBeTruthy()
})
