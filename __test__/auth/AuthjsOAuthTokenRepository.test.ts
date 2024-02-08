import { AuthjsOAuthTokenRepository } from "../../src/features/auth/data"

test("It queries token for user ID and provider", async () => {
  let queriedUserId: string | undefined
  let queriedProvider: string | undefined
  const sut = new AuthjsOAuthTokenRepository({
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
        queriedUserId = values[0]
        queriedProvider = values[1]
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
  expect(queriedUserId).toEqual("1234")
  expect(queriedProvider).toEqual("github")
})

test("It cannot update tokens", async () => {
  const sut = new AuthjsOAuthTokenRepository({
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
        return { rows: [] }
      }
    }
  })
  expect(sut.set("1234", {
    accessToken: "foo",
    refreshToken: "bar"
  })).rejects.toThrow()
})

test("It cannot delete tokens", async () => {
  const sut = new AuthjsOAuthTokenRepository({
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
        return { rows: [] }
      }
    }
  })
  expect(sut.delete("1234")).rejects.toThrow()
})
