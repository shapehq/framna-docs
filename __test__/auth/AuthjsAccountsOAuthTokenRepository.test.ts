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

test("It does not set token", async () => {
  let didSetToken = false
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
      async query(_query, _values: any[] = []) {
        didSetToken = true
        return { rows: [] }
      }
    }
  })
  await sut.set("1234", { accessToken: "foo", refreshToken: "bar" })
  expect(didSetToken).toBeFalsy()
})

test("It does not delete token", async () => {
  let didDeleteToken = false
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
      async query(_query, _values: any[] = []) {
        didDeleteToken = true
        return { rows: [] }
      }
    }
  })
  await sut.delete("1234")
  expect(didDeleteToken).toBeFalsy()
})
