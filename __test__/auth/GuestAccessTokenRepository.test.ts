import { GuestAccessTokenRepository } from "../../src/features/auth/domain"

test("It reads access token for user", async () => {
  let readUserId: string | undefined
  const sut = new GuestAccessTokenRepository({
    async get(userId) {
      readUserId = userId
      return "foo"
    },
    async setExpiring() {},
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
  })
  await sut.set("1234", "bar")
  expect(storedUserId).toBe("1234")
  expect(storedToken).toBe("bar")
  expect(storedTimeToLive).toBeGreaterThan(0)
})
