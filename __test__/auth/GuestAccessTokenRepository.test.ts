import { GuestAccessTokenRepository } from "../../src/features/auth/domain"

test("It reads access token for user", async () => {
  let readUserId: string | undefined
  const sut = new GuestAccessTokenRepository({
    async get(userId) {
      readUserId = userId
      return "foo"
    },
    async setExpiring() {},
    async delete() {}
  })
  const accessToken = await sut.get("1234")
  expect(readUserId).toBe("1234")
  expect(accessToken).toBe("foo")
})

test("It stores access token for user", async () => {
  let storedUserId: string | undefined
  let storedToken: string | undefined
  let storedTimeToLive: number | undefined
  const sut = new GuestAccessTokenRepository({
    async get() {
      return "foo"
    },
    async setExpiring(userId, token, timeToLive) {
      storedUserId = userId
      storedToken = token
      storedTimeToLive = timeToLive
    },
    async delete(userId) {}
  })
  await sut.set("1234", "bar")
  expect(storedUserId).toBe("1234")
  expect(storedToken).toBe("bar")
  expect(storedTimeToLive).toBeGreaterThan(0)
})

test("It deletes access token for user", async () => {
  let deletedUserId: string | undefined
  const sut = new GuestAccessTokenRepository({
    async get() {
      return "foo"
    },
    async setExpiring() {},
    async delete(userId) {
      deletedUserId = userId
    }
  })
  await sut.delete("1234")
  expect(deletedUserId).toBe("1234")
})
