import { OAuthAccountCredentialPersistingLogInHandler } from "../../src/features/auth/domain"

test("It skips handling log in if account is unavailable", async () => {
  let didQuery = false
  const sut = new OAuthAccountCredentialPersistingLogInHandler({
    provider: "github",
    db: {
      async connect() {
        return {
          async query() {
            return { rows: [] }
          },
          async disconnect() {},
        }
      },
      async query() {
        didQuery = true
        return {
          rows: [{
            access_token: "foo",
            refresh_token: "bar"
          }]
        }
      }
    }
  })
  const allowLogin = await sut.handleLogIn("42")
  expect(allowLogin).toBeTruthy()
  expect(didQuery).toBeFalsy()
})

test("It skips handling log in if account does not come from the expected provider", async () => {
  let didQuery = false
  const sut = new OAuthAccountCredentialPersistingLogInHandler({
    provider: "github",
    db: {
      async connect() {
        return {
          async query() {
            return { rows: [] }
          },
          async disconnect() {},
        }
      },
      async query() {
        didQuery = true
        return {
          rows: [{
            access_token: "foo",
            refresh_token: "bar"
          }]
        }
      }
    }
  })
  const allowLogin = await sut.handleLogIn("42", {
    provider: "twitter",
    providerAccountId: "1234",
    access_token: "foo",
    refresh_token: "bar"
  })
  expect(allowLogin).toBeTruthy()
  expect(didQuery).toBeFalsy()
})

test("It disallows login if account has no access token", async () => {
  let didQuery = false
  const sut = new OAuthAccountCredentialPersistingLogInHandler({
    provider: "github",
    db: {
      async connect() {
        return {
          async query() {
            return { rows: [] }
          },
          async disconnect() {},
        }
      },
      async query() {
        didQuery = true
        return {
          rows: [{
            access_token: "foo",
            refresh_token: "bar"
          }]
        }
      }
    }
  })
  const allowLogin = await sut.handleLogIn("42", {
    provider: "twitter",
    providerAccountId: "1234",
    refresh_token: "bar"
  })
  expect(allowLogin).toBeTruthy()
  expect(didQuery).toBeFalsy()
})

test("It disallows login if account has no refresh token", async () => {
  let didQuery = false
  const sut = new OAuthAccountCredentialPersistingLogInHandler({
    provider: "github",
    db: {
      async connect() {
        return {
          async query() {
            return { rows: [] }
          },
          async disconnect() {},
        }
      },
      async query() {
        didQuery = true
        return {
          rows: [{
            access_token: "foo",
            refresh_token: "bar"
          }]
        }
      }
    }
  })
  const allowLogin = await sut.handleLogIn("42", {
    provider: "twitter",
    providerAccountId: "1234",
    access_token: "foo"
  })
  expect(allowLogin).toBeTruthy()
  expect(didQuery).toBeFalsy()
})

test("It stores OAuth account information", async () => {
  let storedProvider: string | undefined
  let storedProviderAccountID: string | undefined
  let storedAccessToken: string | undefined
  let storedRefreshToken: string | undefined
  const sut = new OAuthAccountCredentialPersistingLogInHandler({
    provider: "github",
    db: {
      async connect() {
        return {
          async query() {
            return { rows: [] }
          },
          async disconnect() {},
        }
      },
      async query(_query: string, values: any[] = []) {
        storedProvider = values[0]
        storedProviderAccountID = values[1]
        storedAccessToken = values[2]
        storedRefreshToken = values[3]
        return {
          rows: [{
            access_token: "foo",
            refresh_token: "bar"
          }]
        }
      }
    }
  })
  const allowLogin = await sut.handleLogIn("42", {
    provider: "github",
    providerAccountId: "1234",
    access_token: "foo",
    refresh_token: "bar"
  })
  expect(allowLogin).toBeTruthy()
  expect(storedProvider).toBe("github")
  expect(storedProviderAccountID).toBe("1234")
  expect(storedAccessToken).toBe("foo")
  expect(storedRefreshToken).toBe("bar")
})
