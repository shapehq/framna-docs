import { GuestOAuthTokenDataSource } from "../../src/features/auth/domain"

test("It gets the user's account provider type", async () => {
  let didReadAccountProvider = false
  const sut = new GuestOAuthTokenDataSource({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      },
      async getAccountProvider() {
        didReadAccountProvider = true
        return "email"
      },
      async getEmail() {
        return "foo@example.com"
      },
    },
    gitHubInstallationAccessTokenDataSource: {
      async getAccessToken(_repositoryNames) {
        return "foo"
      },
    },
    guestRepository: {
      async getAll() {
        throw new Error("Not implemented")
      },
      async findByEmail(_email) {
        throw new Error("Not implemented")
      },
      async create(_email, _projects) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email) {
        throw new Error("Not implemented")
      },
      async getProjectsForEmail(_email) {
        return []
      }
    }
  })
  await sut.getOAuthToken()
  expect(didReadAccountProvider).toBeTruthy()
})

test("It throws error if account provider type is not \"email\"", async () => {
  const sut = new GuestOAuthTokenDataSource({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      },
      async getAccountProvider() {
        return "github"
      },
      async getEmail() {
        return "foo@example.com"
      },
    },
    gitHubInstallationAccessTokenDataSource: {
      async getAccessToken(_repositoryNames) {
        return "foo"
      },
    },
    guestRepository: {
      async getAll() {
        throw new Error("Not implemented")
      },
      async findByEmail(_email) {
        throw new Error("Not implemented")
      },
      async create(_email, _projects) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email) {
        throw new Error("Not implemented")
      },
      async getProjectsForEmail(_email) {
        throw new Error("Not implemented")
      }
    }
  })
  await expect(sut.getOAuthToken()).rejects.toThrow()
})

test("It gets the user's projects", async () => {
  let didGetProjects = false
  const sut = new GuestOAuthTokenDataSource({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      },
      async getAccountProvider() {
        return "email"
      },
      async getEmail() {
        return "foo@example.com"
      },
    },
    gitHubInstallationAccessTokenDataSource: {
      async getAccessToken(_repositoryNames) {
        return "foo"
      },
    },
    guestRepository: {
      async getAll() {
        throw new Error("Not implemented")
      },
      async findByEmail(_email) {
        throw new Error("Not implemented")
      },
      async create(_email, _projects) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email) {
        throw new Error("Not implemented")
      },
      async getProjectsForEmail(_email) {
        didGetProjects = true
        return []
      }
    }
  })
  await sut.getOAuthToken()
  expect(didGetProjects).toBeTruthy()
})

test("It creates a GitHub installation access token with access to the user's projects", async () => {
  let repositoriesInAccessToken: string[] = []
  const sut = new GuestOAuthTokenDataSource({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      },
      async getAccountProvider() {
        return "email"
      },
      async getEmail() {
        return "foo@example.com"
      },
    },
    gitHubInstallationAccessTokenDataSource: {
      async getAccessToken(repositoryNames) {
        repositoriesInAccessToken = repositoryNames
        return "foo"
      },
    },
    guestRepository: {
      async getAll() {
        throw new Error("Not implemented")
      },
      async findByEmail(_email) {
        throw new Error("Not implemented")
      },
      async create(_email, _projects) {
        throw new Error("Not implemented")
      },
      async removeByEmail(_email) {
        throw new Error("Not implemented")
      },
      async getProjectsForEmail(_email) {
        return ["foo", "bar"]
      }
    }
  })
  await sut.getOAuthToken()
  expect(repositoriesInAccessToken).toEqual(["foo", "bar"])
})
