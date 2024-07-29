import { OAuthTokenRepository } from "@/features/auth/domain"

test("It reads the auth token for the specified user", async () => {
  let readProvider: string | undefined
  let readUserId: string | undefined
  const sut = new OAuthTokenRepository({
    provider: "github",
    db: {
      async connect() {
        return {
          async query(_query: string, _values: any[] = []) {
            return { rows: [] }
          },
          async disconnect() {},
        }
      },
      async query(_query: string, values: any[] = []) {
        readProvider = values[0]
        readUserId = values[1]
        return {
          rows: [{
            access_token: "foo",
            refresh_token: "bar"
          }]
        }
      }
    }
  })
  const token = await sut.get("1234")
  expect(readProvider).toBe("github")
  expect(readUserId).toBe("1234")
  expect(token.accessToken).toBe("foo")
  expect(token.refreshToken).toBe("bar")
})

test("It stores the auth token for the specified user", async () => {
  let storedProvider: string | undefined
  let storedUserId: string | undefined
  let storedAccessToken: any | undefined
  let storedRefreshToken: any | undefined
  const sut = new OAuthTokenRepository({
    provider: "github",
    db: {
      async connect() {
        return {
          async query(_query: string, _values: any[] = []) {
            return { rows: [] }
          },
          async disconnect() {},
        }
      },
      async query(_query: string, values: any[] = []) {
        storedProvider = values[0]
        storedUserId = values[1]
        storedAccessToken = values[2]
        storedRefreshToken = values[3]
        return { rows: [] }
      }
    }
  })
  const authToken = {
    accessToken: "foo",
    refreshToken: "bar"
  }
  await sut.set("1234", authToken)
  expect(storedProvider).toBe("github")
  expect(storedUserId).toBe("1234")
  expect(storedAccessToken).toBe(authToken.accessToken)
  expect(storedRefreshToken).toBe(authToken.refreshToken)
})

test("It deletes the auth token for the specified user", async () => {
  let deletedUserId: string | undefined
  const sut = new OAuthTokenRepository({
    provider: "github",
    db: {
      async connect() {
        return {
          async query(_query: string, _values: any[] = []) {
            return { rows: [] }
          },
          async disconnect() {},
        }
      },
      async query(_query: string, values: any[] = []) {
        deletedUserId = values[1]
        return { rows: [] }
      }
    }
  })
  await sut.delete("1234")
  expect(deletedUserId).toBe("1234")
})
