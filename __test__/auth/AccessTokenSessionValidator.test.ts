import { AccessTokenSessionValidator, SessionValidity } from "../../src/features/auth/domain"

test("It reads the access token", async () => {
  let didReadAccessToken = false
  const sut = new AccessTokenSessionValidator({
    accessTokenDataSource: {
      async getAccessToken() {
        didReadAccessToken = true
        return "foo"
      }
    }
  })
  await sut.validateSession()
  expect(didReadAccessToken).toBeTruthy()
})

test("It considers session valid when it can read an access token", async () => {
  const sut = new AccessTokenSessionValidator({
    accessTokenDataSource: {
      async getAccessToken() {
        return "foo"
      }
    }
  })
  const validity = await sut.validateSession()
  expect(validity).toBe(SessionValidity.VALID)
})

test("It considers access token to be invalid when failing to get access token", async () => {
  const sut = new AccessTokenSessionValidator({
    accessTokenDataSource: {
      async getAccessToken() {
        throw new Error("Mock error")
      }
    }
  })
  const validity = await sut.validateSession()
  expect(validity).toBe(SessionValidity.INVALID_ACCESS_TOKEN)
})
