import { LogInHandler } from "@/features/auth/domain"

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
  const didLogin = await sut.handleLogIn({
    user: { id: "1234" },
    account: null
  })
  expect(didLogin).toBeFalsy()
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
  const didLogin = await sut.handleLogIn({
    user: {
      id: "1234"
    }, 
    account: {
      provider: "github",
      providerAccountId: "foo@example.com",
      refresh_token: "bar"
    }
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
  const didLogin = await sut.handleLogIn({
    user: {
      id: "1234"
    },
    account: {
      provider: "github",
      providerAccountId: "foo@example.com",
      access_token: "foo"
    }
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
  const didLogin = await sut.handleLogIn({
    user: {
      id: "1234"
    },
    account: {
      provider: "github",
      providerAccountId: "foo@example.com",
      access_token: "foo",
      refresh_token: "bar"
    }
  })
  expect(didLogin).toBeTruthy()
})

test("It persists access token and refresh token when logging in with a GitHub account with a valid user ID", async () => {
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
  const didLogin = await sut.handleLogIn({
    user: {
      id: "1234"
    },
    account: {
      provider: "github",
      providerAccountId: "foo@example.com",
      access_token: "foo",
      refresh_token: "bar"
    }
  })
  expect(didLogin).toBeTruthy()
  expect(persistedUserId).toBe("1234")
  expect(persistedAccessToken).toBe("foo")
  expect(persistedRefreshToken).toBe("bar")
})

test("It skips persisting access token and refresh token when logging in with a GitHub account with a temporary user ID", async () => {
  let didPersistTokens = false
  const sut = new LogInHandler({
    oauthTokenRepository: {
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {
        didPersistTokens = true
      },
      async delete(_userId) {},
    }
  })
  const didLogin = await sut.handleLogIn({
    user: {
      // A temporary user ID is any string that is not an integer.
      id: "3d3e2ac4-6b06-41b3-8340-d210c733c62d"
    },
    account: {
      provider: "github",
      providerAccountId: "foo@example.com",
      access_token: "foo",
      refresh_token: "bar"
    }
  })
  expect(didLogin).toBeTruthy()
  expect(didPersistTokens).toBeFalsy()
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
  const didLogin = await sut.handleLogIn({
    user: {
      id: "1234"
    }, 
    account: {
      provider: "github",
      providerAccountId: "foo@example.com",
      access_token: "foo",
      refresh_token: "bar"
    }
  })
  expect(didLogin).toBeFalsy()
  expect(didAttemptToPersistTokens).toBeTruthy()
})
