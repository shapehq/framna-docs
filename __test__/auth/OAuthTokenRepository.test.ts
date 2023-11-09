import { OAuthTokenRepository } from "../../src/features/auth/domain"

test("It reads the auth token for the specified user", async () => {
  let readUserId: string | undefined
  const sut = new OAuthTokenRepository({
    async get(userId) {
      readUserId = userId
      return JSON.stringify({
        accessToken: "foo",
        refreshToken: "bar"
      })
    },
    async set() {},
    async setExpiring() {},
    async delete() {}
  })
  await sut.get("1234")
  expect(readUserId).toBe("1234")
})

test("It stores the auth token for the specified user", async () => {
  let storedUserId: string | undefined
  let storedJSON: any | undefined
  const sut = new OAuthTokenRepository({
    async get() {
      return ""
    },
    async set() {},
    async setExpiring(userId, data) {
      storedUserId = userId
      storedJSON = data
    },
    async delete() {}
  })
  const authToken = {
    accessToken: "foo",
    refreshToken: "bar"
  }
  await sut.set("1234", authToken)
  const storedObj = JSON.parse(storedJSON)
  expect(storedUserId).toBe("1234")
  expect(storedObj.accessToken).toBe(authToken.accessToken)
  expect(storedObj.refreshToken).toBe(authToken.refreshToken)
})

test("It deletes the auth token for the specified user", async () => {
  let deletedUserId: string | undefined
  const sut = new OAuthTokenRepository({
    async get() {
      return ""
    },
    async set() {},
    async setExpiring() {},
    async delete(userId) {
      deletedUserId = userId
    }
  })
  await sut.delete("1234")
  expect(deletedUserId).toBe("1234")
})
