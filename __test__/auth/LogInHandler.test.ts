import { LogInHandler } from "../../src/features/auth/domain"

test("It disallows logging in when account is undefined", async () => {
  const sut = new LogInHandler({
    userRepository: {
      async findByEmail(_email) {
        return undefined
      },
    },
    guestRepository: {
      async getAll() {
        return []
      },
      async findByEmail(_email: string) {
        return undefined
      },
      async create(_email: string, _projects: string[]) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email: string) {},
      async getProjectsForEmail(_email: string) {
        return []
      }
    },
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

test("It disallows logging in when guest with no mail", async () => {
  const sut = new LogInHandler({
    userRepository: {
      async findByEmail(_email) {
        return undefined
      },
    },
    guestRepository: {
      async getAll() {
        return []
      },
      async findByEmail(_email: string) {
        return undefined
      },
      async create(_email: string, _projects: string[]) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email: string) {},
      async getProjectsForEmail(_email: string) {
        return []
      }
    },
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
      provider: "nodemailer",
      providerAccountId: "foo@example.com"
    }
  })
  expect(didLogin).toBeFalsy()
})

test("It disallows logging in guest that has not been invited", async () => {
  const sut = new LogInHandler({
    userRepository: {
      async findByEmail(_email) {
        return undefined
      },
    },
    guestRepository: {
      async getAll() {
        return []
      },
      async findByEmail(_email: string) {
        return undefined
      },
      async create(_email: string, _projects: string[]) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email: string) {},
      async getProjectsForEmail(_email: string) {
        return []
      }
    },
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
      id: "1234",
      email: "foo@example.com"
    },
    account: {
      provider: "nodemailer",
      providerAccountId: "foo@example.com"
    }
  })
  expect(didLogin).toBeFalsy()
})

test("It allows logging in guest who has been invited", async () => {
  const sut = new LogInHandler({
    userRepository: {
      async findByEmail(_email) {
        return undefined
      },
    },
    guestRepository: {
      async getAll() {
        return []
      },
      async findByEmail(email: string) {
        return {
          status: "invited",
          email: email,
          projects: ["example-openapi"]
        }
      },
      async create(_email: string, _projects: string[]) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email: string) {},
      async getProjectsForEmail(_email: string) {
        return []
      }
    },
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
      id: "1234",
      email: "foo@example.com"
    },
    account: {
      provider: "nodemailer",
      providerAccountId: "foo@example.com"
    }
  })
  expect(didLogin).toBeTruthy()
})

test("It redirects user to OAuth error when attempting to login as a guest with an e-mail address for a user that has previously logged in using GitHub", async () => {
  const sut = new LogInHandler({
    userRepository: {
      async findByEmail(email) {
        return {
          id: 1234,
          email: email,
          name: "John Doe",
          image: null,
          accounts: [{ provider: "github" }]
        }
      },
    },
    guestRepository: {
      async getAll() {
        return []
      },
      async findByEmail(_email: string) {
        return undefined
      },
      async create(_email: string, _projects: string[]) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email: string) {},
      async getProjectsForEmail(_email: string) {
        return []
      }
    },
    oauthTokenRepository: {
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {},
      async delete(_userId) {},
    }
  })
  const result = await sut.handleLogIn({
    user: {
      id: "1234",
      email: "foo@example.com"
    },
    account: {
      provider: "nodemailer",
      providerAccountId: "foo@example.com"
    }
  })
  expect(result).toBe("/api/auth/signin?error=OAuthAccountNotLinked")
})

test("It disallows logging in using a GitHub Account without an access token", async () => {
  const sut = new LogInHandler({
    userRepository: {
      async findByEmail(_email) {
        return undefined
      },
    },
    guestRepository: {
      async getAll() {
        return []
      },
      async findByEmail(_email: string) {
        return undefined
      },
      async create(_email: string, _projects: string[]) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email: string) {},
      async getProjectsForEmail(_email: string) {
        return []
      }
    },
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
    userRepository: {
      async findByEmail(_email) {
        return undefined
      },
    },
    guestRepository: {
      async getAll() {
        return []
      },
      async findByEmail(_email: string) {
        return undefined
      },
      async create(_email: string, _projects: string[]) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email: string) {},
      async getProjectsForEmail(_email: string) {
        return []
      }
    },
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
    userRepository: {
      async findByEmail(_email) {
        return undefined
      },
    },
    guestRepository: {
      async getAll() {
        return []
      },
      async findByEmail(_email: string) {
        return undefined
      },
      async create(_email: string, _projects: string[]) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email: string) {},
      async getProjectsForEmail(_email: string) {
        return []
      }
    },
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
    userRepository: {
      async findByEmail(_email) {
        return undefined
      },
    },
    guestRepository: {
      async getAll() {
        return []
      },
      async findByEmail(_email: string) {
        return undefined
      },
      async create(_email: string, _projects: string[]) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email: string) {},
      async getProjectsForEmail(_email: string) {
        return []
      }
    },
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
    userRepository: {
      async findByEmail(_email) {
        return undefined
      },
    },
    guestRepository: {
      async getAll() {
        return []
      },
      async findByEmail(_email: string) {
        return undefined
      },
      async create(_email: string, _projects: string[]) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email: string) {},
      async getProjectsForEmail(_email: string) {
        return []
      }
    },
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
    userRepository: {
      async findByEmail(_email) {
        return undefined
      },
    },
    guestRepository: {
      async getAll() {
        return []
      },
      async findByEmail(_email: string) {
        return undefined
      },
      async create(_email: string, _projects: string[]) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email: string) {},
      async getProjectsForEmail(_email: string) {
        return []
      }
    },
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
