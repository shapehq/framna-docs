import { AuthjsAccountsOAuthTokenRepository } from "../../src/features/auth/domain"

test("It gets token for user ID and provider", async () => {
  let queryUserId: string | undefined
  let queryProvider: string | undefined
  const sut = new AuthjsAccountsOAuthTokenRepository({
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
      async query(_query, values: any[] = []) {
        queryProvider = values[0]
        queryUserId = values[1]
        return {
          rows: [{
            access_token: "foo",
            refresh_token: "bar"
          }]
        }
      }
    }
  })
  await sut.get("1234")
  expect(queryUserId).toEqual("1234")
  expect(queryProvider).toEqual("github")
})

test("It sets token for user ID and provider", async () => {
  let queryUserId: string | undefined
  let queryProvider: string | undefined
  let queryAccessToken: string | undefined
  let queryRefreshToken: string | undefined
  const sut = new AuthjsAccountsOAuthTokenRepository({
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
      async query(_query, values: any[] = []) {
        queryProvider = values[0]
        queryUserId = values[1]
        queryAccessToken = values[2]
        queryRefreshToken = values[3]
        return {
          rows: [{
            access_token: "foo",
            refresh_token: "bar"
          }]
        }
      }
    }
  })
  await sut.set("1234", { accessToken: "foo", refreshToken: "bar" })
  expect(queryUserId).toEqual("1234")
  expect(queryProvider).toEqual("github")
  expect(queryAccessToken).toEqual("foo")
  expect(queryRefreshToken).toEqual("bar")
})

test("It deletes token for user ID and provider", async () => {
  let queryUserId: string | undefined
  let queryProvider: string | undefined
  const sut = new AuthjsAccountsOAuthTokenRepository({
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
      async query(_query, values: any[] = []) {
        queryProvider = values[0]
        queryUserId = values[1]
        return {
          rows: [{
            access_token: "foo",
            refresh_token: "bar"
          }]
        }
      }
    }
  })
  await sut.delete("1234")
  expect(queryUserId).toEqual("1234")
  expect(queryProvider).toEqual("github")
})
