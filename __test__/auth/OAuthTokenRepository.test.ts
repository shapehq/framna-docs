import { OAuthTokenRepository } from "../../src/features/auth/domain"

test("It reads the auth token for the specified user", async () => {
  let readUserId: string | undefined
  const sut = new OAuthTokenRepository({
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
        readUserId = values[0]
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
  expect(readUserId).toBe("1234")
  expect(token.accessToken).toBe("foo")
  expect(token.refreshToken).toBe("bar")
})

test("It stores the auth token for the specified user", async () => {
  let storedUserId: string | undefined
  let storedAccessToken: any | undefined
  let storedRefreshToken: any | undefined
  const sut = new OAuthTokenRepository({
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
        storedUserId = values[0]
        storedAccessToken = values[1]
        storedRefreshToken = values[2]
        return { rows: [] }
      }
    }
  })
  const authToken = {
    accessToken: "foo",
    refreshToken: "bar"
  }
  await sut.set("1234", authToken)
  expect(storedUserId).toBe("1234")
  expect(storedAccessToken).toBe(authToken.accessToken)
  expect(storedRefreshToken).toBe(authToken.refreshToken)
})

test("It deletes the auth token for the specified user", async () => {
  let deletedUserId: string | undefined
  const sut = new OAuthTokenRepository({
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
        deletedUserId = values[0]
        return { rows: [] }
      }
    }
  })
  await sut.delete("1234")
  expect(deletedUserId).toBe("1234")
})
