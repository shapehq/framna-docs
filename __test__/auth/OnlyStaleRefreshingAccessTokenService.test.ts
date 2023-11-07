import { OnlyStaleRefreshingAccessTokenService } from "../../src/features/auth/domain"

test("It refreshes the access token when the input access token is equal to the stored access token", async () => {
  let didRefreshAccessToken = false
  const sut = new OnlyStaleRefreshingAccessTokenService({
    async getAccessToken() {
      return "foo"
    },
    async refreshAccessToken() {
      didRefreshAccessToken = true
      return "foo"
    }
  })
  await sut.refreshAccessToken("foo")
  expect(didRefreshAccessToken).toBeTruthy()
})

test("It skips refreshing the access token when the input access token is not equal to the stored access token", async () => {
  let didRefreshAccessToken = false
  const sut = new OnlyStaleRefreshingAccessTokenService({
    async getAccessToken() {
      return "foo"
    },
    async refreshAccessToken() {
      didRefreshAccessToken = true
      return "foo"
    }
  })
  await sut.refreshAccessToken("outdated")
  expect(didRefreshAccessToken).toBeFalsy()
})

test("It reads access token", async () => {
  let didReadAccessToken = false
  const sut = new OnlyStaleRefreshingAccessTokenService({
    async getAccessToken() {
      didReadAccessToken = true
      return "foo"
    },
    async refreshAccessToken() {
      return "foo"
    }
  })
  await sut.getAccessToken()
  expect(didReadAccessToken).toBeTruthy()
})