import { OAuthTokenSessionValidator, SessionValidity } from "@/features/auth/domain"

test("It reads the access token", async () => {
  let didReadOAuthToken = false
  const sut = new OAuthTokenSessionValidator({
    oauthTokenDataSource: {
      async getOAuthToken() {
        didReadOAuthToken = true
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      }
    }
  })
  await sut.validateSession()
  expect(didReadOAuthToken).toBeTruthy()
})

test("It considers session valid when it can read an access token", async () => {
  const sut = new OAuthTokenSessionValidator({
    oauthTokenDataSource: {
      async getOAuthToken() {
        return {
          accessToken: "foo",
          refreshToken: "bar"
        }
      }
    }
  })
  const validity = await sut.validateSession()
  expect(validity).toBe(SessionValidity.VALID)
})

test("It considers access token to be invalid when failing to get access token", async () => {
  const sut = new OAuthTokenSessionValidator({
    oauthTokenDataSource: {
      async getOAuthToken() {
        throw new Error("Mock error")
      }
    }
  })
  const validity = await sut.validateSession()
  expect(validity).toBe(SessionValidity.INVALID_ACCESS_TOKEN)
})
