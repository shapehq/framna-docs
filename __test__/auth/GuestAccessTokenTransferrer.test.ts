import { GuestAccessTokenTransferrer } from "../../src/features/auth/domain"

test("It reads the user ID and email", async () => {
  let didReadUserId = false
  let didReadEmail = false
  const sut = new GuestAccessTokenTransferrer({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        didReadUserId = true
        return "1234"
      },
      async getEmail() {
        didReadEmail = true
        return "john@example.com"
      },
      async getAccountProviderType() {
        return "github"
      }
    },
    guestRepository: {
      async findByEmail(_email) {
        return { projects: [] }
      }
    },
    installationAccessTokenDataSource: {
      async getAccessToken(_projects) {
        return "foo"
      }
    },
    destinationOAuthTokenRepository: {
      async get(_userId) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }
  })
  await sut.transferAccessToken()
  expect(didReadUserId).toBeTruthy()
  expect(didReadEmail).toBeTruthy()
})

test("It throws an error if the guest was not found", async () => {
  const sut = new GuestAccessTokenTransferrer({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      },
      async getEmail() {
        return "john@example.com"
      },
      async getAccountProviderType() {
        return "github"
      }
    },
    guestRepository: {
      async findByEmail(_email) {
        return undefined
      }
    },
    installationAccessTokenDataSource: {
      async getAccessToken(_projects) {
        return "foo"
      }
    },
    destinationOAuthTokenRepository: {
      async get(_userId) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }
  })
  await expect(sut.transferAccessToken()).rejects.toThrow()
})

test("It creates installation access token for guest's projects", async () => {
  let didCreateAccessToken = false
  let allowedProjects: string[] | undefined
  const sut = new GuestAccessTokenTransferrer({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      },
      async getEmail() {
        return "john@example.com"
      },
      async getAccountProviderType() {
        return "github"
      }
    },
    guestRepository: {
      async findByEmail(_email) {
        return { projects: ["foo", "bar" ]}
      }
    },
    installationAccessTokenDataSource: {
      async getAccessToken(projects) {
        didCreateAccessToken = true
        allowedProjects = projects
        return "foo"
      }
    },
    destinationOAuthTokenRepository: {
      async get(_userId) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }
  })
  await sut.transferAccessToken()
  expect(didCreateAccessToken).toBeTruthy()
  expect(allowedProjects).toEqual(["foo", "bar"])
})

test("It stores OAuth token with an access token and no refresh token for user ID", async () => {
  let storedUserId: string | undefined
  let storedAccessToken: string | undefined
  let storedRefreshToken: string | undefined = "to_be_overriden_with_undefined"
  const sut = new GuestAccessTokenTransferrer({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      },
      async getEmail() {
        return "john@example.com"
      },
      async getAccountProviderType() {
        return "github"
      }
    },
    guestRepository: {
      async findByEmail(_email) {
        return { projects: ["foo", "bar" ]}
      }
    },
    installationAccessTokenDataSource: {
      async getAccessToken(_projects) {
        return "foo"
      }
    },
    destinationOAuthTokenRepository: {
      async get(_userId) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set(userId, token) {
        storedUserId = userId
        storedAccessToken = token.accessToken
        storedRefreshToken = token.refreshToken
      },
      async delete(_userId) {}
    }
  })
  await sut.transferAccessToken()
  expect(storedUserId).toBe("1234")
  expect(storedAccessToken).toBe("foo")
  expect(storedRefreshToken).toBeUndefined()
})

test("It returns newly created access token", async () => {
  const sut = new GuestAccessTokenTransferrer({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      },
      async getEmail() {
        return "john@example.com"
      },
      async getAccountProviderType() {
        return "github"
      }
    },
    guestRepository: {
      async findByEmail(_email) {
        return { projects: ["foo", "bar" ]}
      }
    },
    installationAccessTokenDataSource: {
      async getAccessToken(_projects) {
        return "foo-bar"
      }
    },
    destinationOAuthTokenRepository: {
      async get(_userId) {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }
  })
  const accessToken = await sut.transferAccessToken()
  expect(accessToken).toBe("foo-bar")
})